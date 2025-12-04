#!/bin/bash

# Application startup script
echo "Starting Spring Boot and Angular applications..."

# Stop existing processes
echo "Stopping existing processes..."
pkill -f "java.*EdgeApplication" 2>/dev/null
pkill -f "ng serve" 2>/dev/null

# Wait a bit
sleep 2

# Start Spring Boot application
echo "Starting Spring Boot application..."
cd /Users/hidenori/Documents/Spring/MySprintApp
./gradlew bootRun &
SPRING_PID=$!

# Wait for Spring Boot to start
echo "Waiting for Spring Boot to start..."
sleep 15

# Start Angular application
echo "Starting Angular application..."
cd /Users/hidenori/Documents/Spring/MySprintApp/client
npm start &
ANGULAR_PID=$!

echo "Applications started!"
echo "Spring Boot PID: $SPRING_PID"
echo "Angular PID: $ANGULAR_PID"
echo ""
echo "Spring Boot: http://localhost:8080"
echo "Angular: http://localhost:4200"
echo ""
echo "To stop applications, press Ctrl+C"

# Monitor processes
wait
