#!/bin/bash

# アプリケーション起動スクリプト
echo "Starting Spring Boot and Angular applications..."

# 既存のプロセスを停止
echo "Stopping existing processes..."
pkill -f "java.*EdgeApplication" 2>/dev/null
pkill -f "ng serve" 2>/dev/null

# 少し待機
sleep 2

# Spring Bootアプリケーションを起動
echo "Starting Spring Boot application..."
cd /Users/hidenori/Documents/Spring/MySprintApp
./gradlew bootRun &
SPRING_PID=$!

# Spring Bootの起動を待機
echo "Waiting for Spring Boot to start..."
sleep 15

# Angularアプリケーションを起動
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

# プロセスの監視
wait
