const faq = [
  [
    "Quelles aides IA sont incluses dans mon accès ?",
    "Pro et le Pack Examen incluent le tuteur IA, la simplification et la synthèse de cours, l’explication d’erreurs de QCM et la proposition de cartes personnelles modifiables. Vous pouvez aussi demander un retour sur une réponse à un cas, un entraînement écrit à l’oral ou un entretien de recrutement. Ces aides se déclenchent à votre demande ; leurs réponses restent à vérifier avec les supports.",
  ],
  [
    "L’utilisation de l’IA est-elle illimitée ?",
    "Non. Toutes les aides partagent une même enveloppe : jusqu’à 20 demandes par jour et 300 par mois, sous réserve du budget de génération disponible. Les retours écrits sur les cas, l’oral et le recrutement sont aussi limités à 5 par jour et 60 par mois. L’enveloppe restante est visible dans le tuteur. Les cours et exercices enregistrés restent accessibles sans génération IA.",
  ],
  [
    "Peut-on essayer les exercices avant de s’abonner ?",
    "Oui. La page Tester mon UE propose cinq QCM expliqués et trois flashcards dans chacune des 20 UE, sans compte ni carte bancaire. Un chapitre complet de DCG UE9, sa fiche et dix QCM sont également offerts sur Exemple gratuit. Les autres contenus et le suivi personnalisé nécessitent un accès Pro actif ou un Pack Examen.",
  ],
  [
    "Les exercices sont-ils des annales officielles ?",
    "Les QCM et cas SIMDCG sont originaux. L’espace Annales propose séparément des PDF de sujets d’examen de l’État, avec leur source et un chronomètre. Il ne fournit pas de corrigés réservés aux enseignants.",
  ],
  [
    "Quelles matières sont couvertes ?",
    "La bibliothèque propose des contenus dans les 13 matières obligatoires du DCG et les 7 du DSCG. Les chapitres restent une couverture partielle des programmes, avec une liste consultable avant l’achat.",
  ],
  [
    "Que faire si j’ai payé mais que mon compte reste gratuit ?",
    "Connectez-vous au compte utilisé lors de l’achat, puis ouvrez Mon compte et cliquez sur « Retrouver mon achat ». Si la recherche échoue, contactez contact.simdcg@gmail.com avec votre référence de paiement.",
  ],
];
function FAQ() {
  return (
    <section className="container section faq">
      <div>
        <span className="eyebrow">EN TOUTE CLARTÉ</span>
        <h2>
          Vos questions,
          <br />
          nos réponses.
        </h2>
        <p>Un doute ? Nous sommes là pour vous aider.</p>
        <a href="mailto:contact.simdcg@gmail.com">
          Contacter le support
        </a>
      </div>
      <div>
        {faq.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span>+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default FAQ;
