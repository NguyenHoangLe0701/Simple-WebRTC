FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app

# copy từ root vào
COPY backend ./backend
RUN mvn -f backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/backend/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]