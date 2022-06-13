# Checkers-AWS
Checkers rappresenta una versione multiplayer online del gioco da tavolo Dama.
Gli utenti hanno la possibilità di registrarsi al sito creando un proprio account.
Una volta eseguito l’accesso, sarà possibile effettuare una partita contro un altro giocatore online mediante un meccanismo di ricerca o tramite invito.
Una volta che due giocatori si trovano in una lobby è possibile avviare una partita e sarà messa a disposizione una chat di gioco per lo scambio di messaggi.
Conclusasi la partita, verranno aggiornate le statistiche di gioco di ogni giocatore, e verranno assegnati dei punti in base alle performance; questi punti potranno essere utilizzati per stilare una classifica generale dei giocatori.

## Report
Questo progetto è stato svolto per il corso di Applicazioni e Servizi Web dell'Università di Bologna, campus di Cesena (IT).

Dai un'occhiata alla [documentazione](https://github.com/Mosgheo/Checkers-AWS/blob/main/doc/Checkers_AWS.pdf) del progetto.

## Deployment
Il sistema è stato deployato attraverso DigitalOcean pertanto è possibile utilizzare direttamente l'ultima versione rilasciata dall'indirizzo http://134.209.205.242:8080/.

Alternativamente per lanciare l'applicazione è sufficiente:
*  collocarsi all'interno della cartella src 
*  copiare il file [.env](https://drive.google.com/file/d/1mG_XDa5Ea6PjOHELxn58vxGmSOxpSLv2/) con tutti i secret
*  eseguire il comando: 
<pre><code>docker-compose up</code></pre>
Al termine della fase di deploy si potrà accedere al servizio al seguente indirizzo: http://localhost:8000/

## Basic Use
Se non si vuole usufruire del deployment, è possibile eseguire l'applicativo nella maniera primordiale lanciando singolarmente i tre servizi del Backend.
### UserService
*  Spostarsi nella cartella Checkers-UserService
* Copiare il file [.env](https://drive.google.com/file/d/1lmgtsKn72Lre3753G40e_fq6SHvd5fL_/)
* Eseguire la coppia di comandi nel seguente ordine
<pre><code>npm ci
node index.js
</code></pre>
### GameService
* Spostarsi nella cartella Checkers-GameService
* Copiare il file [.env](https://drive.google.com/file/d/1KFrMwNvDbEUS12ECI_9ETeiFN_dhPuWm/)
* Eseguire la coppia di comandi nel seguente ordine
<pre><code>npm ci
node index.js
</code></pre>
### CoomunicationService
* Spostarsi nella cartella Checkers-CoomunicationService
* Copiare il file [.env](https://drive.google.com/file/d/1Yu7OgPrGOGBGMV70bkjkDd_bemcDqhEB/)
* Eseguire la coppia di comandi nel seguente ordine
<pre><code>npm ci
node index.js
</code></pre>
### Frontend
* Spostarsi nella cartella Checkers-Frontend
* Eseguire la coppia di comandi nel seguente ordine
<pre><code>npm ci
npm run serve --port X
</code></pre>
dove X è la porta in cui si vuole far girare il client.

## Authors
* [Luca Salvigni](https://github.com/Mosgheo)
* [Manuele Pasini](https://github.com/ManuelePasini)