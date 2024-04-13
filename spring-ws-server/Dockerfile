FROM maven:3.8-openjdk-8 AS build
COPY . .
RUN mvn clean package -DskipTests

FROM adoptopenjdk/openjdk8:ubi
COPY --from=build /target/chat-0.0.1-SNAPSHOT.jar chat.jar
EXPOSE 8080

ENTRYPOINT ["java","-jar","demo.jar"]