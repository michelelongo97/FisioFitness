export default function CookiePolicy() {
  return (
    <main className="legal-page">
      <div className="chi-container">
        <h1>Cookie Policy</h1>
        <p>
          Il sito <strong>costafisiofitness.it</strong> utilizza cookie tecnici
          necessari al corretto funzionamento del sito e, solo previo consenso,
          eventuali contenuti di terze parti che potrebbero impostare propri
          cookie.
        </p>
        <h2>Cosa sono i cookie</h2>
        <p>
          I cookie sono piccoli file di testo che i siti visitati inviano al
          dispositivo dell'utente, dove vengono memorizzati per essere poi
          ritrasmessi agli stessi siti alla visita successiva.
        </p>
        <h2>Tipologie di cookie utilizzati</h2>
        <p>Questo sito utilizza:</p>
        <ul>
          <li>cookie tecnici di navigazione</li>
          <li>
            un token di autenticazione salvato localmente nel browser (non un
            cookie in senso stretto, ma un dato equivalente), necessario per
            mantenere l'accesso all'area personale degli utenti registrati
          </li>
          <li>
            una preferenza salvata localmente nel browser per ricordare la
            scelta espressa riguardo ai cookie di terze parti (accettati o
            rifiutati)
          </li>
        </ul>
        <h2>Video e contenuti multimediali</h2>
        <p>
          Nella pagina "Video" il sito mostra video ospitati direttamente sui
          propri server (nessun contenuto incorporato da piattaforme esterne).
          Ogni video riporta un link che rimanda al reel originale pubblicato su
          Instagram: si tratta di un semplice collegamento ipertestuale, che non
          imposta alcun cookie né trasmette dati a Meta finché l'utente non
          decide volontariamente di cliccarlo.
        </p>
        <h2>Cookie di terze parti</h2>
        <p>
          Il sito non incorpora attualmente contenuti di terze parti che
          impostano cookie in autonomia. Qualora in futuro venissero
          reintrodotti contenuti embeddati (ad esempio video o mappe di
          fornitori esterni), il relativo caricamento avverrà solo previo
          consenso esplicito dell'utente, raccolto tramite l'apposito banner o
          pulsante di attivazione presente sul contenuto.
        </p>
        <h2>Consenso all'uso dei cookie</h2>
        <p>
          I cookie tecnici e il token di autenticazione non richiedono consenso,
          in quanto strettamente necessari al funzionamento del sito e dell'area
          personale. Eventuali cookie di terze parti verrebbero impostati solo
          dopo consenso esplicito dell'utente, raccolto tramite il banner
          mostrato alla prima visita.
        </p>
        <h2>Gestione e revoca del consenso</h2>
        <p>
          L'utente può modificare in qualsiasi momento la scelta precedentemente
          espressa cliccando su "Gestisci cookie" nel footer del sito, che
          riapre il banner di consenso. È inoltre possibile gestire o
          disabilitare i cookie direttamente dalle impostazioni del proprio
          browser. Disabilitare il token di autenticazione richiederà di
          effettuare nuovamente l'accesso ad ogni visita.
        </p>
        <p>Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
