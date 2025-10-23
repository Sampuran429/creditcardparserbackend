FROM openjdk:11-jre-slim

WORKDIR /tabula

# Download the latest Tabula jar (v1.0.5)
RUN apt-get update && apt-get install -y wget && \
    wget https://github.com/tabulapdf/tabula-java/releases/download/v1.0.5/tabula-1.0.5-jar-with-dependencies.jar -O tabula.jar && \
    apt-get clean

# Keep container running for API calls
CMD ["tail", "-f", "/dev/null"]