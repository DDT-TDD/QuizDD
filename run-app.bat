@echo off
echo 🚀 Starting Educational Quiz App...
echo ================================

echo 📦 Installing dependencies...
call npm install

echo 🗄️ Setting up database...
cd src-tauri
cargo run --bin seed_database
cd ..

echo 🎮 Starting the app...
echo.
echo The app will open in a new window shortly!
echo You can now test all the new flag questions in the Geography section.
echo.
cargo tauri dev

pause