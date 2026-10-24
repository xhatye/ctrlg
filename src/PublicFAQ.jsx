const faq = [
  [
    "Peut-on essayer les exercices avant de s’abonner ?",
    "Un chapitre de DCG UE9 est offert : cours complet, fiche et dix QCM expliqués, sans compte ni carte bancaire. Retrouvez-le sur la page Exemple gratuit. Les autres contenus interactifs nécessitent un accès Pro actif ou un Pack Examen.",
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
