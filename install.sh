# verify package manager to install git ffmpeg, nodejs, npm, webp (apt, pacman, yum)
echo "Instalando dependencias..."
if [ $(which apt) ]; then
    if [ $(which pkg) ]; then
        yes | pkg update
        apt update 2>&1>/dev/null
        apt install curl git ffmpeg nodejs libwebp -y 2>&1>/dev/null
        
    else
        apt update 2>&1>/dev/null
        apt install curl git ffmpeg nodejs npm webp -y 2>&1>/dev/null || apt install curl git ffmpeg nodejs npm libwebp -y 2>&1>/dev/null || apt install curl git ffmpeg nodejs libwebp -y 2>&1>/dev/null
    fi
elif [ $(which pacman) ]; then
  pacman -Sy curl git ffmpeg nodejs npm libwebp --noconfirm
elif [ $(which yum) ]; then
  yum install git curl ffmpeg nodejs npm libwebp --noconfirm
else
  echo "No package manager found"
  exit 1
fi

if [ "$1" != "-yt" ]; then  # if you don't want to install yt-dlp, use the -yt flag
    echo "Instalando yt-dlp..."
    curl https://gist.githubusercontent.com/kamuridesu/b56067968e154f16bfd1af6bde18e929/raw/8b32b4390983359b60941f429083daf5ee51aacf/yt-dlp.sh | bash
fi

# check if current folder is not a git repository
if [ ! -d .git ]; then
    echo "Baixando bot..."
    git clone https://github.com/kamuridesu/WhatsappBot.git 2>&1>/dev/null
    cd WhatsappBot
fi

# install node modules
npm i
npx nodemon index.js