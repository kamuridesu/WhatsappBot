if [ echo $PREFIX | grep -o "com.termux" ]; then
    pkg update
    pkg install nodejs ffmpeg libwebp git -y
else
    apt update 2>&1 > /dev/null && curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -\nsudo apt-get install -y nodejs && apt install ffmpeg git webpx || pacman -Syu 2>&1 >/dev/null && pacman -S nodejs ffmpeg libwebp git
fi
git clone https://github.com/kamuridesu/js-bot.git
cd js-bot
npm i
npx nodemon index.js
