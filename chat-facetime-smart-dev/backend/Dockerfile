# Sử dụng Maven để build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Sử dụng JDK nhẹ để chạy
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Chạy Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
