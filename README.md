# Checkers-AWS

Componenti del gruppo

Luca Salvigni(0000952607)
Manuele Pasini(0000926769)

Checkers e rappresenta una versione multiplayer online del gioco da tavolo Dama.
Gli utenti hanno la possibilità di registrarsi al sito creando un proprio account.
Una volta eseguito l’accesso, sarà possibile effettuare una partita contro un altro giocatore online mediante un meccanismo di ricerca o tramite invito.
Una volta che due giocatori si trovano in una lobby è possibile avviare una partita e sarà messa a disposizione una chat di gioco per lo scambio di messaggi.
Conclusasi la partita, verranno aggiornate le statistiche di gioco di ogni giocatore, e verranno assegnati dei punti in base alle performance; questi punti potranno essere utilizzati per stilare una classifica generale dei giocatori.

## Deployment
Il deployment dell'applicazione è stato realizzato mediante Docker: ad ognuno dei tre servizi che compongono il backend è stato associato un Dockerfile che permette la corretta inizializzazione del servizio a cui fa riferimento; inoltre la stessa configurazione è stata realizzata per il frontend.\newline
Per lanciare l'applicazione è sufficiente collocarsi all'interno della cartella di progetto ed eseguire il comando
<pre><code>docker-compose up
</code></pre>

Alternativamente, è possibile eseguire l'applicativo nella maniera primordiale lanciando singolarmente i tre servizi del Backend posizionandosi all'interno delle cartelle dei singoli servizi eseguendo nel seguente ordine la coppia di comandi:
<pre><code>npm install
node index.js
</code></pre>

Se si vuole utilizzare questo approccio è necessario modificare le stringhe attraverso le quali il SocketService si mette in comunicazione con i restanti due servizi; nel dettaglio all'interno del file .env nella cartella del SocketService è necessario aggiornare le seguenti righe di codice:
<pre><code># USER_SERVICE = "http://userservice:3031"
# GAME_SERVICE = "http://gameservice:3032"

USER_SERVICE = "http://localhost:3031"
GAME_SERVICE = "http://localhost:3032"
</code></pre>
Mentre per quanto riguarda l'avvio di un client bisognerà spostarsi all'inerno della cartella \textbf{src} legata al Frontend ed utilizzare il comando:
<pre><code>npm run serve --port X
</code></pre>
dove X è la porta in cui si vuole far girare il client.
