export default function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <div className="chi-container">
        <h1>Privacy Policy</h1>

        <p>
          La presente informativa è resa ai sensi dell'art. 13 del Regolamento
          UE 2016/679 (GDPR) a coloro che visitano il sito web
          <strong> costafisiofitness.it</strong> e a coloro che si registrano
          come utenti per usufruire del servizio di prenotazione.
        </p>

        <h2>Titolare del trattamento</h2>
        <p>
          Il Titolare del trattamento è:
          <br />
          <strong>Dr. Costantino Picciallo</strong>
          <br />
          Fisioterapista
          <br />
          Email: {import.meta.env.VITE_EMAIL}
        </p>

        <h2>Tipologia di dati trattati</h2>
        <p>Il sito raccoglie e tratta le seguenti categorie di dati:</p>
        <ul>
          <li>
            <strong>Dati di contatto forniti volontariamente</strong> (telefono,
            email, WhatsApp) da chi richiede informazioni o consulenze
          </li>
          <li>
            <strong>Dati account utente</strong>: nome, indirizzo email e
            password (quest'ultima conservata in forma crittografata/hashata,
            mai in chiaro), creati dal titolare al momento dell'attivazione
            dell'abbonamento in studio
          </li>
          <li>
            <strong>Dati di abbonamento e prenotazione</strong>: numero di
            ingressi acquistati e utilizzati, date di validità dell'abbonamento,
            date e orari delle sedute prenotate, stato di presenza alle sedute
          </li>
          <li>
            <strong>Dati tecnici di sessione</strong>: un token di
            autenticazione (JWT) salvato nel browser dell'utente per mantenere
            l'accesso all'area personale
          </li>
        </ul>

        <h2>Finalità del trattamento</h2>
        <p>I dati raccolti sono utilizzati esclusivamente per:</p>
        <ul>
          <li>rispondere a richieste di informazioni</li>
          <li>fissare, gestire e ricordare appuntamenti o consulenze</li>
          <li>
            gestire l'accesso all'area personale e il conteggio degli ingressi
            dell'abbonamento
          </li>
          <li>comunicazioni dirette con il professionista</li>
        </ul>

        <h2>Base giuridica del trattamento</h2>
        <p>
          Il trattamento si basa sul consenso dell'utente (contatto diretto) e,
          per gli utenti registrati, sull'esecuzione del rapporto contrattuale
          relativo all'abbonamento e ai servizi di fisioterapia/allenamento
          richiesti.
        </p>

        <h2>Servizi di terze parti utilizzati</h2>
        <p>
          Per il funzionamento del sito ci si avvale dei seguenti fornitori, che
          possono trattare dati per conto del Titolare in qualità di
          responsabili del trattamento:
        </p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> — hosting del sito e delle funzioni di
            backend
          </li>
          <li>
            <strong>Neon</strong> — database dove sono conservati gli account
            utente, gli abbonamenti e le prenotazioni
          </li>
          <li>
            <strong>Sanity.io</strong> — gestione dei contenuti del blog
          </li>
          <li>
            <strong>Meta/Instagram</strong> — visualizzazione di contenuti video
            incorporati (reel) nella pagina "Video"
          </li>
        </ul>

        <h2>Modalità di trattamento</h2>
        <p>
          I dati sono trattati con strumenti informatici e telematici nel
          rispetto delle misure di sicurezza previste dalla normativa vigente.
          Le password degli utenti registrati sono conservate esclusivamente in
          forma crittografata e non sono mai leggibili in chiaro, nemmeno dal
          Titolare.
        </p>

        <h2>Conservazione dei dati</h2>
        <p>
          I dati di contatto vengono conservati per il tempo necessario a
          soddisfare la richiesta dell'utente. I dati degli account registrati
          (utenti, abbonamenti, prenotazioni) sono conservati per la durata del
          rapporto con lo studio e per il tempo necessario ad adempiere a
          eventuali obblighi di legge. I dati non vengono ceduti a terzi per
          finalità commerciali.
        </p>

        <h2>Diritti dell'utente</h2>
        <p>L'utente ha il diritto di:</p>
        <ul>
          <li>accedere ai propri dati</li>
          <li>chiederne la rettifica o cancellazione</li>
          <li>limitare o opporsi al trattamento</li>
          <li>
            richiedere la cancellazione del proprio account e dei dati associati
          </li>
        </ul>

        <p>
          Le richieste possono essere inviate all'indirizzo email indicato
          sopra.
        </p>

        <p>Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
