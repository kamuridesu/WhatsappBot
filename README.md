#  WhatsappBot
[![CodeFactor](https://www.codefactor.io/repository/github/kamuridesu/whatsappbot/badge)](https://www.codefactor.io/repository/github/kamuridesu/whatsappbot)
![GitHub Repo stars](https://img.shields.io/github/stars/kamuridesu/WhatsappBot?style=social)
![GitHub issues by-label](https://img.shields.io/github/issues/kamuridesu/WhatsappBot/help%20wanted.svg)


Este é um simples bot para WhatsApp feito em Javscript construido em cima do [Baileys](https://github.com/adiwajshing/Baileys).

O principal objetivo deste projeto não é ser um bot cheio de recursos, mas sim prover um bot limpo e organizado para você implementar suas próprias funções e comandos facilmente. O bot também tem uma função de atualização automática, então você vai receber as ultimas atualizações se usar este repositório.

## Como usar
### Via install
Baixe e rode o [install.sh](https://raw.githubusercontent.com/kamuridesu/WhatsappBot/main/install.sh).
## Via clone
Clone este repositório, edit o arquivo [config/config.admin.json](https://github.com/kamuridesu/WhatsappBot/blob/main/config/config.admin.json) com seu numero de telefone (exemplo: 551100000000) e o prefixo do seu bot. Depois instale as depenências: ffmpeg, webp, nodejs.

Em seguida, rode os comandos:
- `npm i`
- `npx nodemon index.js`

Caso queira criar seu próprio repositório, use o botão de template e altere o git clone no [install.sh](https://raw.githubusercontent.com/kamuridesu/WhatsappBot/main/install.sh) e a linha 19: `url: "https://raw.githubusercontent.com/kamuridesu/WhatsappBot/main/package.json"` em src/functions.js, redirecionando ambos para seu repositório.

## Todos os comandos:
| Comando | Descrição                         |
|---------|-------------------------------------|
| start   | Mostra a mensagem de inicio do bot |
| test    | Envia uma mensagem de texto                |
| repeat  |  repete o que o user diz |
| sticker  |  cria um sticker a partir de imagem ou video, passe o nome do pacote e autor como: !sticker meupacote eu |
| ajuda    |  Mostra todos os comandos |

## Contribuição
Crie um pull request com suas mudanças.

## Contato
Me chama no Telegram: [@kamuridesu](https://t.me/kamuridesu)

Ou entre no [grupo de discussão do WhatsApp](https://chat.whatsapp.com/FCIGqV5RehW2wgalxZ4KDm)


#  WhatsappBot

This is a simple JavaScript WhatApp Bot built on top of [Baileys](https://github.com/adiwajshing/Baileys).

The main objective of this project is not to be a full featured bot, but to provide a clean and organized bot so you can implement your own functions and commands easily. The bot also has an auto update feature, so you'll receive the latest updates if you use this repository. 

## How to use
Clone this repository, create a JSON named config.admin.json with your number and your bot prefix. You can follow [this example](https://github.com/kamuridesu/WhatsappBot/blob/main/example.config.admin.json).

If you want to create your own repository, use the template button and change the git clone on [install.sh](https://raw.githubusercontent.com/kamuridesu/WhatsappBot/main/install.sh) and the line 19: `url: "https://raw.githubusercontent.com/kamuridesu/WhatsappBot/main/package.json"` in src/functions.js, redirecting both to your repo.

## All the commands:
| Command | Description                         |
|---------|-------------------------------------|
| start   | Shows the start message for the bot |
| test    | Sends a text message                |
| repeat  |  repeat what the user says |
| sticker  |  creates a sticker from imagem or video, pass the packname and author like: !sticker mypack me |
| ajuda    |  Shows a menu with all the commands |

More commands will be addded as the development goes on.

## Contributing
Create a pull requests with your changes.

## Contact
Contact me on Telegram: [@kamuridesu](https://t.me/kamuridesu)

Or enter on the [WhatsApp Discussion Group](https://chat.whatsapp.com/FCIGqV5RehW2wgalxZ4KDm)
