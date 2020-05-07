import constants from './constants';
import Auth0Lock from 'auth0-lock';
import quiz from './quiz';
import enrollment from './enrollment';
import certificate from './certificate';
import misc from './misc';

window.GraphAcademyLogin = class GraphAcademyLogin {
	constructor(options = {}) {
		if (!Auth0Lock || typeof Auth0Lock !== 'function') return;
		this.lock = new Auth0Lock('hoNo6B00ckfAoFVzPTqzgBIJHFHDnHYu', 'login.neo4j.com', constants.auth0Options);
		this.options = { ...constants.DEFAULT_OPTIONS, ...options };

		// User data
		this.quizesStatus = [];
		this.enrollment = [];
		this.currentModule = '';
		this.moduleCount = null;
		this.currentModuleQuizStatus = null;
	}

	checkSession(cb) {
		const { options, lock } = this;
		const { trainingClassName } = options;
		misc.handleHtmlOnState('checkingSession', options);
		lock.checkSession({}, async (err, result) => {

			if (err) {
				this.isLoggedIn = false;
				if (options.loginRedirectUrl) {
					this.redirectToLogin();
				}
			}

			if (result) {
				this.isLoggedIn = true;
				this.authResult = result;
				const accessToken = result.accessToken;
				console.log(accessToken)
				// Handle enrollment
				const [err, enrollmentResponse] = await enrollment.getEnrollmentForClass(trainingClassName, accessToken);
				if (enrollmentResponse.status === 200) {
					this.enrollment = enrollmentResponse.data;
				}

				if (!this.enrollment.enrolled && options.enrollmentUrl) {
					window.location.href = options.enrollmentUrl;
				}

				if (!options.isCourseLandingPage && this.enrollment.enrolled) {
					if (this.enrollment.enrolled) await this.handleQuizSetup();
				}

				// Hanlde callback
				if (this.callback && typeof this.callback === 'function') this.callback()
			}

			misc.handleHtmlOnState(result ? 'loggedIn' : 'notLoggedIn', options);
			if (cb && typeof cb === 'function') cb(err, result);
		})
	}

	async enrollStudentInClass(firstName, lastName) {
		const { options: { trainingClassName }, authResult: { accessToken } } = this;
		return await enrollment.enrollStudentInClass(firstName, lastName, trainingClassName, accessToken);
	}

	async handleQuizSetup() {
		const { options: { trainingClassName }, authResult: { accessToken } } = this;
		const value = await quiz.getQuizStatus(trainingClassName, accessToken);
		this.quizesStatus = value['quizStatus'];
		this.currentModule = $(".quiz").attr("id");
		this.currentModuleQuizStatus = this.quizesStatus.passed.indexOf(this.currentModule) > -1 ? 'passed' : 'failed';
		if (this.quizesStatus.untried.indexOf(this.currentModule) > -1) this.currentModuleQuizStatus = 'untried';
		this.moduleCount = this.quizesStatus.passed.length + this.quizesStatus.failed.length + this.quizesStatus.untried.length;

		await this.handleSummaryPageHtml();
		this.attachQuizSubmit();
		await this.updateQuizRelateHtml();
	}

	attachQuizSubmit() {
		$('.next-section').click((event) => {
			event.preventDefault();

			const { options: { trainingClassName }, result: { accessToken }, quizesStatus } = this;
			var hrefSuccess = event.target.href;
			var quizSuccess = quiz.gradeQuiz($(".quiz").first(), quizesStatus); // gradeQuiz($( this ).closest(".quiz"));

			if (quizSuccess) {
				$("#submit-message").remove();
				// Move current module from failed/untried to passed
				const index = quizesStatus[this.currentModuleQuizStatus].indexOf(this.currentModule);
				quizesStatus[this.currentModuleQuizStatus].splice(index, 1);
				quizesStatus.passed.push(this.currentModule);
			} else {
				$(".next-section").before("<div id='submit-message'><p id='submit-message'><span style='color: red'>Please correct errors</span> in quiz responses above to continue.  Questions with incorrect responses are highlighted in <span style='color: red'>red</span>.</p></div>");
				$("#submit-message").append("<div class='paragraph'><a href='" + hrefSuccess + "'>Click here</a> if you wish to advance to next section without passing the quiz.</div>")
			}

			const { passed, failed } = quizesStatus;
			quiz.postQuizStatus(passed, failed, trainingClassName, accessToken).then(
				function () {
					if (quizSuccess) {
						document.location = hrefSuccess;
					}
				}
			);
		});
	}

	async updateQuizRelateHtml() {
		const { quizesStatus } = this;
		for (let index in quizesStatus.passed) {
			const moduleName = quizesStatus.passed[index];
			$('#menu-' + moduleName + ' .fa-stack').css('color', 'green');
			$('#menu-' + moduleName + ' .fa-stack-1x').html('<span class="fa fa-check" style="padding-top: 6px"></span>');

			$("#" + moduleName + "-progress").removeClass("fa-circle-thin");
			$("#" + moduleName + "-progress").removeClass("fa-close");
			$("#" + moduleName + "-progress").removeClass("fa-check");

			$("#" + moduleName + "-progress").css("color", "green");
			$("#" + moduleName + "-progress").addClass("fa-check");
		}

		for (let index in quizesStatus.failed) {
			const moduleName = quizesStatus.failed[index];
			$("#" + moduleName + "-progress").removeClass("fa-circle-thin");
			$("#" + moduleName + "-progress").removeClass("fa-close");
			$("#" + moduleName + "-progress").removeClass("fa-check");

			$("#" + moduleName + "-progress").css("color", "red");
			$("#" + moduleName + "-progress").addClass("fa-close");
		}

		// If the current quiz is passed, clicking on continue wil take to next page.
		const isCurrentQuizPass = this.currentModuleQuizStatus === 'passed';
		if (isCurrentQuizPass) {
			$("#_grade_quiz_and_continue h3").text("Quiz successfully submitted.");
			$(".quiz").hide();
			$(".next-section").unbind("click");
			$(".next-section").click(function (event) {
				document.location = event.target.href;
				return false;
			});
		}
	}

	async handleSummaryPageHtml() {
		const { quizesStatus, moduleCount, options: { trainingClassName }, authResult: { accessToken } } = this;
		// Only into effect on the last page of the course
		if (quizesStatus.passed.length === moduleCount) {
			$('#quizes-result').html("<p>All quizes taken successfully.</p>");
		} else {
			$('#quizes-result').html("<p>Some quizes not answered successfully.  Return to course modules by clicking on the numbers  in the navigation at the top of the page.</p>");
		}

		const certificateElement = $('#cert-result');
		if (certificateElement.length) {
			certificateElement.html("<i>... Checking for certificate ...</i>");
			const [err, result] = await certificate.getClassCertificate(trainingClassName, accessToken);
			if (result && result.data && result.data.url) {
				$('#cert-result').html("<a href=\"" + result.data['url'] + "\">Download Certificate</a>");
			} else {
				$('#cert-result').html("Certificate not available yet.  Did you complete the quizzes at the end of each section?");
			}
		}
	}

	logout() {
		const { options } = this;
		const logoutOptions = {};
		if (options.logoutOptions && options.logoutOptions.shouldRedirect) logoutOptions.redirectTo = options.redirectOnLogout;
		this.lock.logout(logoutOptions);
		misc.handleHtmlOnState('notLoggedIn', options);
	}

	redirectToLogin() {
		const { options } = this;
		return window.location.href = options.loginRedirectUrl;
	}
}