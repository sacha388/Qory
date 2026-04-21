import type { Metadata } from 'next';
import StaticInfoPage from '@/app/components/static-info-page';

const pageDescription =
  'Mentions légales de Qory (qory.fr) : éditeur, hébergement, propriété intellectuelle, responsabilité, liens, données, droit applicable et juridiction (LCEN).';

export const metadata: Metadata = {
  title: 'Mentions légales Qory | Éditeur, hébergeur et responsabilité',
  description: pageDescription,
  alternates: {
    canonical: '/mentions-legales',
  },
};

export default function MentionsLegalesPage() {
  return (
    <StaticInfoPage
      title="Mentions légales"
      breadcrumbLabel="Mentions légales"
      intro={['Dernière mise à jour : 23 mars 2026.']}
      sections={[
        {
          title: '',
          paragraphs: [
            'Conformément aux dispositions de l’article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, ainsi qu’à l’ensemble des textes législatifs, réglementaires et, plus largement, des principes juridiques applicables en droit français aux services de communication au public en ligne, il est porté à la connaissance de toute personne accédant, naviguant, consultant, visualisant, utilisant, sollicitant ou exploitant, à quelque titre que ce soit, le site internet accessible à l’adresse qory.fr, les présentes mentions légales, lesquelles ont notamment pour objet de préciser l’identité de l’éditeur du site, le cadre juridique dans lequel le site est mis à disposition, les conditions générales de son accès, les limites de responsabilité applicables à son utilisation, ainsi que les principales règles régissant les contenus, fonctionnalités, liens, éléments techniques et informations qui y figurent.',
            'L’accès, la consultation, la navigation et l’utilisation du site impliquent la prise de connaissance préalable des présentes mentions légales. Il appartient à tout utilisateur de les lire attentivement, de s’y référer aussi souvent que nécessaire et, plus généralement, de s’assurer que l’usage qu’il fait du site, des services qui y sont proposés et des informations qui y sont diffusées est compatible avec le cadre exposé ci-après. Les présentes mentions légales sont susceptibles d’être modifiées, complétées, révisées, mises à jour ou restructurées à tout moment, notamment pour tenir compte d’une évolution technique, réglementaire, légale, jurisprudentielle, éditoriale ou commerciale. En conséquence, seule la version en vigueur au moment de la consultation du site est applicable, sans préjudice des dispositions impératives qui trouveraient à s’appliquer indépendamment de toute stipulation contraire.',
          ],
        },
        {
          title: '1. Portée générale et finalité du site',
          paragraphs: [
            'Le site qory.fr a pour objet principal de présenter, rendre accessible, commercialiser ou permettre l’utilisation du service Qory, lequel constitue un service numérique d’analyse de la visibilité de sites internet dans des environnements de réponse générés ou assistés par intelligence artificielle. Dans ce cadre, le site peut être amené à afficher, structurer, synthétiser ou mettre à disposition un certain nombre d’informations relatives au fonctionnement du service, à ses finalités, à ses usages possibles, à ses résultats, à sa logique générale, à ses conditions d’accès, à ses modalités tarifaires, à ses limites de fonctionnement ou encore à la nature des éléments d’analyse qu’il est susceptible de produire.',
            'Le service proposé via le site a vocation à fournir, selon les cas et selon les fonctionnalités effectivement disponibles au moment de l’utilisation, des éléments tels que des scores, indicateurs, signaux, observations, priorités, synthèses, recommandations, rapprochements, visualisations, constats ou aides à la décision concernant la présence, la lisibilité, la reprise, la citation, l’exposition, la compréhension ou la mise en avant d’un site web dans certains environnements numériques, conversationnels ou génératifs. Il est expressément rappelé que ces éléments ont une valeur d’aide à la lecture, d’assistance, d’orientation ou d’éclairage, mais ne peuvent en aucun cas être regardés comme des garanties, promesses fermes, engagements de résultat, validations juridiques, assurances de performance ou certifications opposables.',
          ],
        },
        {
          title: '2. Accès au site et conditions techniques de disponibilité',
          paragraphs: [
            'Le site est, sauf interruption, restriction, limitation ou indisponibilité temporaire ou durable, accessible à toute personne disposant d’un accès au réseau internet et d’un équipement technique compatible. L’éditeur met en œuvre des moyens raisonnables pour assurer la disponibilité, la continuité, l’accessibilité et le bon fonctionnement du site, mais ne saurait garantir que celui-ci soit accessible de manière permanente, continue, rapide, ininterrompue, sécurisée, exempte de défaut, adaptée à tout terminal ou pleinement compatible avec tout environnement logiciel, matériel ou réseau.',
            'L’accès au site peut être suspendu, ralenti, perturbé ou interrompu pour des raisons tenant notamment à la maintenance, à l’évolution technique, à la mise à jour des services, à des opérations correctives, à des contraintes d’hébergement, à des incidents de sécurité, à des événements affectant les réseaux ou les fournisseurs tiers, à des opérations de migration, à des erreurs involontaires, à des cas de force majeure ou, plus généralement, à toute circonstance extérieure ou intérieure ne permettant pas un fonctionnement nominal du service. L’utilisateur reconnaît qu’il utilise le site dans un environnement technologique qui échappe, pour partie, au contrôle de l’éditeur, et qu’il lui appartient, le cas échéant, de prendre toutes mesures utiles pour assurer la protection de ses propres matériels, logiciels, connexions, accès et données.',
          ],
        },
        {
          title: '3. Conditions générales d’usage du site',
          paragraphs: [
            'L’utilisation du site suppose un usage normal, licite, loyal, raisonnable et conforme à la destination des services proposés. Tout utilisateur s’engage, de manière générale, à ne pas porter atteinte au bon fonctionnement, à l’intégrité, à la sécurité, à la disponibilité ou à la réputation du site, à ne pas tenter d’en détourner la finalité, à ne pas rechercher ou exploiter d’éventuelles failles, à ne pas accéder ou tenter d’accéder sans autorisation à des interfaces, traitements, données, codes, systèmes, fonctionnalités ou environnements techniques qui ne lui seraient pas explicitement ouverts, et à ne pas procéder à des extractions, copies, réutilisations, reproductions massives, exploitations automatisées, indexations non autorisées, ré-ingénieries ou détournements des contenus, structures ou restitutions proposées.',
            'L’utilisateur s’interdit également d’introduire ou de transmettre tout code malveillant, virus, script nuisible, dispositif de perturbation, robot non autorisé, charge abusive, tentative d’automatisation ou contenu illicite, et plus généralement d’adopter tout comportement de nature à compromettre, ralentir, perturber ou altérer l’expérience normale d’utilisation du site.',
            'L’éditeur se réserve, sans préavis ni indemnité, le droit de suspendre, restreindre, bloquer ou supprimer l’accès à tout ou partie du site à tout utilisateur dont l’activité apparaîtrait incompatible avec la sécurité, la destination, l’intégrité, la légalité ou les intérêts légitimes du site et de son exploitation.',
          ],
        },
        {
          title: '4. Nature, portée et limites du service Qory',
          paragraphs: [
            'Le service Qory repose sur des traitements techniques, analytiques, algorithmiques, statistiques, heuristiques et, le cas échéant, automatisés, pouvant intégrer des systèmes d’intelligence artificielle, des mécanismes d’interprétation, des outils de synthèse, des structures de priorisation et des logiques de lecture destinées à produire une représentation intelligible de certains signaux liés à la visibilité, à la compréhension ou à la reprise d’un site internet dans des environnements de réponse générative ou assimilés.',
            'Les éléments produits, qu’il s’agisse de scores, de constats, d’indicateurs, de résumés, d’alertes, de recommandations, de plans d’action, de classements, de priorités, de suggestions ou d’analyses détaillées, sont fournis à titre purement informatif et décisionnel. Ils n’ont pas vocation à constituer une garantie de résultat, une validation exhaustive de la situation d’un site, une certitude quant à la manière dont un moteur, un agent conversationnel, une interface IA ou un système tiers reprendra ou non certaines informations, ni un engagement relatif à l’évolution future de la visibilité, du trafic, de la citation, du référencement ou de la performance économique d’un site.',
            'Il est rappelé, à cet égard, que tout environnement numérique, moteur, modèle, index, base de données, plateforme de réponse, système conversationnel ou architecture d’intelligence artificielle évolue de manière constante, selon des paramètres que l’éditeur ne maîtrise pas intégralement. Par conséquent, les résultats fournis par Qory doivent être interprétés comme des indications, estimations, analyses ou lectures contextuelles fondées sur un état donné des signaux observés, et non comme des garanties fermes ou des promesses opposables. L’utilisateur demeure seul responsable de l’usage qu’il fait des informations obtenues, des décisions qu’il prend sur leur fondement, ainsi que des conséquences, directes ou indirectes, qui peuvent en résulter.',
          ],
        },
        {
          title: '5. Propriété intellectuelle et protection des éléments du site',
          paragraphs: [
            'L’ensemble des éléments composant le site qory.fr, qu’ils soient accessibles directement ou indirectement, pris isolément ou dans leur organisation d’ensemble, et notamment, sans que cette énumération soit limitative, les textes, formulations, structures rédactionnelles, éléments graphiques, logotypes, marques, dénominations, slogans, titres, chartes visuelles, séquences d’interface, animations, visuels, captures, logiciels, scripts, développements, bases de données, compositions, éléments sonores, documents, systèmes de restitution, méthodes de présentation, structures de navigation, arborescences, contenus téléchargeables, architectures fonctionnelles, codes sources, codes objets, ainsi que tout autre composant du site, sont protégés par les dispositions du Code de la propriété intellectuelle et, plus généralement, par tout droit de propriété intellectuelle, droit voisin, droit du producteur de bases de données, droit des marques ou règles relatives à la concurrence déloyale et au parasitisme.',
            'En conséquence, toute reproduction, représentation, diffusion, adaptation, traduction, extraction, réutilisation, publication, communication, modification, assemblage, décompilation, revente, exploitation ou mise à disposition, totale ou partielle, de tout ou partie de ces éléments, par quelque procédé que ce soit et sur quelque support que ce soit, sans l’autorisation écrite, expresse et préalable de l’éditeur, est strictement interdite. Toute violation de ces droits est susceptible de constituer un acte de contrefaçon ou une atteinte aux droits de l’éditeur, susceptible d’engager la responsabilité de son auteur, notamment au regard des articles L.335-2 et suivants du Code de la propriété intellectuelle, sans préjudice de toute autre action fondée sur le droit commun, la concurrence déloyale, le parasitisme ou les règles spécifiques applicables.',
          ],
        },
        {
          title: '6. Identification de l’éditeur du site',
          paragraphs: [
            'Le site qory.fr est édité par la société Paratore Group, constituée sous la forme d’une société par actions simplifiée unipersonnelle (SASU), au capital social de 1 euro, ayant son siège social 329 chemin du Gay, 38500 La Buisse, France, immatriculée sous le numéro SIREN 992 066 357, enregistrée au Registre du commerce et des sociétés de Grenoble, identifiée à la taxe sur la valeur ajoutée intracommunautaire sous le numéro FR75992066357, et pouvant être contactée à l’adresse électronique suivante : contact@paratoregroup.com.',
          ],
        },
        {
          title: '7. Direction de la publication',
          paragraphs: [
            'La direction de la publication du site est assurée par Sacha Paratore, agissant en qualité de président de la société Paratore Group. À ce titre, il assure, dans le cadre des dispositions applicables, la responsabilité éditoriale du site, sous réserve, le cas échéant, de l’intervention technique ou fonctionnelle de prestataires tiers sur certains éléments d’infrastructure, de diffusion ou de maintenance.',
          ],
        },
        {
          title: '8. Hébergement du site',
          paragraphs: [
            'Le site qory.fr est hébergé par la société Vercel Inc., dont l’adresse est 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis, accessible à l’adresse https://vercel.com. L’hébergement recouvre la mise à disposition des ressources techniques, serveurs, capacités de déploiement, de stockage, de diffusion et d’accessibilité nécessaires au fonctionnement du site. Il est précisé que l’hébergeur n’assume aucune responsabilité éditoriale quant aux contenus publiés par l’éditeur et n’intervient pas, en cette seule qualité, dans la définition, la validation ou la portée juridique des informations figurant sur le site.',
          ],
        },
        {
          title: '9. Limitation générale de responsabilité',
          paragraphs: [
            'L’éditeur s’efforce de mettre à disposition un site et des contenus aussi fiables, cohérents, accessibles, clairs et actualisés que possible. Il ne saurait toutefois garantir l’exhaustivité absolue des informations diffusées, leur exactitude parfaite, leur actualisation continue, leur pertinence pour chaque situation particulière, ni l’absence totale d’erreur, d’omission, d’imprécision, d’incompatibilité, de dysfonctionnement, de défaut de sécurité ou d’altération.',
            'En conséquence, et dans les limites autorisées par le droit applicable, l’éditeur ne pourra être tenu responsable des dommages directs, indirects, accessoires, immatériels, particuliers ou consécutifs résultant notamment de l’accès au site, de son indisponibilité, de son utilisation, de l’impossibilité de l’utiliser, de la confiance accordée aux contenus publiés, des résultats obtenus par le service, de l’interprétation faite des scores, analyses ou recommandations, des décisions prises par l’utilisateur, d’une interruption temporaire, d’un incident technique, d’une défaillance réseau, d’une incompatibilité logicielle, d’une attaque extérieure, d’un virus, d’une corruption de données, d’une perte d’exploitation, d’une perte de chance, d’une perte de revenus, d’une perte d’image ou, plus généralement, de tout préjudice lié, directement ou indirectement, à l’utilisation du site ou des services qui y sont proposés.',
            'Il appartient à l’utilisateur d’apprécier, sous sa seule responsabilité, la pertinence des informations obtenues et l’opportunité des actions qu’il choisit d’engager à la suite de la consultation du site ou des résultats fournis.',
          ],
        },
        {
          title: '10. Liens hypertextes et services tiers',
          paragraphs: [
            'Le site peut contenir des liens vers des sites, ressources, plateformes, services, outils, contenus ou interfaces tiers. Ces liens sont fournis à titre indicatif, documentaire, fonctionnel ou pratique. L’éditeur ne dispose d’aucun contrôle permanent sur ces ressources externes et ne saurait être tenu responsable de leur disponibilité, de leur contenu, de leur exactitude, de leur légalité, de leur sécurité, de leurs conditions contractuelles, de leurs pratiques de traitement de données, de leurs politiques de confidentialité ou de toute conséquence liée à leur consultation ou à leur utilisation. La présence d’un lien hypertexte vers un site tiers ne saurait être interprétée comme une approbation, une validation, une recommandation, une association ou une prise de responsabilité quant au contenu ou au fonctionnement du service concerné.',
          ],
        },
        {
          title: '11. Données communiquées par l’utilisateur',
          paragraphs: [
            'Dans le cadre de l’utilisation du site ou du service, l’utilisateur peut être amené à transmettre certaines informations, notamment des adresses de sites internet, éléments d’identification, données contextuelles, indications relatives à un site ou toute autre information nécessaire à la bonne exécution du service proposé. L’utilisateur garantit qu’il dispose du droit d’utiliser les informations qu’il transmet, qu’elles ne sont pas manifestement illicites, qu’elles ne portent pas atteinte aux droits de tiers et qu’elles n’ont pas pour objet ou pour effet de détourner le site de sa finalité. L’utilisateur demeure exclusivement responsable des informations qu’il soumet et des conséquences qui peuvent résulter de leur transmission.',
          ],
        },
        {
          title: '12. Sécurité',
          paragraphs: [
            'L’éditeur met en œuvre des mesures raisonnables et proportionnées destinées à assurer la sécurité, l’intégrité, la disponibilité et la résilience du site, compte tenu de sa nature, de ses usages, de son architecture, de son environnement d’hébergement et de l’état des connaissances techniques. Toutefois, aucune technologie, infrastructure ou transmission sur internet ne pouvant garantir une sécurité absolue, l’éditeur ne saurait promettre l’absence totale de faille, d’intrusion, d’interruption, de vulnérabilité, d’accès non autorisé ou d’événement extérieur affectant le site. L’utilisateur reconnaît qu’il lui appartient également de protéger ses propres outils, accès, logiciels, équipements et données.',
          ],
        },
        {
          title: '13. Évolution du site et des services',
          paragraphs: [
            'L’éditeur se réserve la faculté de modifier, compléter, suspendre, interrompre, retirer, faire évoluer, restreindre ou remplacer, à tout moment et sans préavis, tout ou partie du site, des fonctionnalités, des contenus, des services, des interfaces, des parcours d’utilisation, des modalités d’accès, des présentations, des structures ou des offres proposées. Ces évolutions peuvent résulter de nécessités techniques, juridiques, économiques, éditoriales, commerciales, sécuritaires ou stratégiques. L’utilisateur reconnaît que le site et les services qui y sont liés sont susceptibles d’évoluer en permanence et que l’éditeur n’est tenu à aucune obligation de maintien à l’identique d’une version antérieure.',
          ],
        },
        {
          title: '14. Droit applicable',
          paragraphs: [
            'Les présentes mentions légales sont régies par le droit français. Elles sont rédigées en langue française. Dans l’hypothèse où elles feraient l’objet d’une traduction, seule la version française ferait foi entre les parties en cas de contradiction, de divergence d’interprétation ou de contestation portant sur leur sens ou leur portée.',
          ],
        },
        {
          title: '15. Juridiction compétente',
          paragraphs: [
            'Sous réserve des dispositions légales impératives applicables et, le cas échéant, des règles protectrices bénéficiant aux consommateurs, tout différend, litige, contestation ou difficulté relatif à la validité, à l’interprétation, à l’exécution ou à l’utilisation du site qory.fr, ou plus généralement en lien avec les présentes mentions légales, sera soumis à la compétence des juridictions du ressort du Tribunal judiciaire de Grenoble.',
          ],
        },
        {
          title: '16. Contact',
          paragraphs: [
            'Toute demande relative au site, à son éditeur, à son fonctionnement, à son exploitation ou aux présentes mentions légales peut être adressée à l’adresse suivante : contact@paratoregroup.com.',
          ],
        },
      ]}
      seoPath="/mentions-legales"
      seoDescription={pageDescription}
    />
  );
}
