# --------- Stage 1: Build app với Maven ---------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy code backend vào container
COPY ../backend ./
RUN ./mvnw clean package -DskipTests

# --------- Stage 2: Run app ---------
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render sẽ set biến PORT, Spring Boot cần nghe port này
ENV PORT=8080
EXPOSE 8080

CMD ["java", "-jar", "app.jar"]