echo "Rendering Training"
#asciidoctor -T s adoc/01_OverviewOfNeo4jAdministration.adoc -o html/01_OverviewOfNeo4jAdministration.html
#asciidoctor -T s adoc/02_ManagingANeo4jDatabase.adoc -o html/02_ManagingANeo4jDatabase.html
#asciidoctor -T s adoc/03_CausalClusteringInNeo4j.adoc -o html/03_CausalClusteringInNeo4j.html
asciidoctor -T s adoc/04_SecurityInNeo4j.adoc -o html/04_SecurityInNeo4j.html
#asciidoctor -T s adoc/05_GettingMoreOutOfQueries.adoc -o html/05_GettingMoreOutOfQueries.html
#asciidoctor -T s adoc/06_CreatingNodesAndRelationships.adoc -o html/06_CreatingNodesAndRelationships.html
#asciidoctor -T s adoc/07_GettingMoreOutOfNeo4j.adoc -o html/07_GettingMoreOutOfNeo4j.html

#asciidoctor-pdf -T s adoc/01_OverviewOfNeo4jAdministration.adoc -a allow-uri-read -a pdf-style=asciidoc-themes/01.yml -o pdf/01_OverviewOfNeo4jAdministration.pdf
#asciidoctor-pdf -T s adoc/02_ManagingANeo4jDatabase.adoc -a allow-uri-read -a pdf-style=asciidoc-themes/02.yml -o pdf/02_ManagingANeo4jDatabase.pdf
#asciidoctor-pdf -T s adoc/03_CausalClusteringInNeo4j.adoc -a allow-uri-read -a pdf-style=asciidoc-themes/03.yml -o pdf/03_CausalClusteringInNeo4j.pdf
asciidoctor-pdf -T s adoc/04_SecurityInNeo4j.adoc -a allow-uri-read -a pdf-style=asciidoc-themes/04.yml -o pdf/04_SecurityInNeo4j.pdf
#asciidoctor-pdf -T s adoc/05_GettingMoreOutOfQueries.adoc -a allow-uri-read  -a pdf-style=asciidoc-themes/05.yml -o pdf/05_GettingMoreOutOfQueries.pdf
#asciidoctor-pdf -T s adoc/06_CreatingNodesAndRelationships.adoc -a allow-uri-read -a pdf-style=asciidoc-themes/06.yml -o pdf/06_CreatingNodesAndRelationships.pdf
#asciidoctor-pdf -T s adoc/07_GettingMoreOutOfNeo4j.adoc -a allow-uri-read  -a pdf-style=asciidoc-themes/07.yml   -o pdf/07_GettingMoreOutOfNeo4j.pdf

#open html/01_OverviewOfNeo4jAdministration.html
#open html/02_ManagingANeo4jDatabase.html
#open html/03_CausalClusteringInNeo4j.html
open html/04_SecurityInNeo4j.html
#open html/05_GettingMoreOutOfQueries.html
#open html/06_CreatingNodesAndRelationships.html
#open html/07_GettingMoreOutOfNeo4j.html