import type { Metadata } from 'next';
import StaticInfoPage from '@/app/components/static-info-page';
import { buildPageMetadata } from '@/app/lib/metadata';

const pageDescription =
  'Politique de confidentialité Qory (qory.fr) : données collectées, finalités, bases légales, cookies, sous-traitants, transferts hors EEE, durées, sécurité, droits RGPD et CNIL.';

export const metadata: Metadata = buildPageMetadata({
  title: 'Politique de confidentialité Qory | RGPD, données et droits',
  description: pageDescription,
  path: '/confidentialite',
});

export default function ConfidentialitePage() {
  return (
    <StaticInfoPage
      title="Politique de confidentialité"
      breadcrumbLabel="Confidentialité"
      intro={['Dernière mise à jour : 23 mars 2026.']}
      sections={[
        {
          title: '',
          paragraphs: [
            'La présente politique de confidentialité a pour objet d’informer toute personne physique accédant au site qory.fr, utilisant le service Qory, commandant un rapport, sollicitant une analyse, entrant en contact avec l’éditeur ou interagissant, de quelque manière que ce soit, avec les fonctionnalités proposées, sur la manière dont ses données à caractère personnel sont collectées, utilisées, conservées, sécurisées, le cas échéant transmises, et plus généralement traitées par l’éditeur du site. Elle a également pour objet de rappeler les droits dont disposent les personnes concernées sur leurs données, ainsi que les modalités concrètes leur permettant d’exercer ces droits. La CNIL recommande qu’une telle information soit accessible sur une page dédiée, claire et à jour.',
            'L’utilisation du site et du service implique la prise de connaissance de la présente politique. Celle-ci peut être modifiée, mise à jour, complétée ou réorganisée à tout moment, notamment afin de tenir compte d’une évolution légale, réglementaire, jurisprudentielle, technique, fonctionnelle ou organisationnelle. La version applicable est celle publiée sur le site au moment de la consultation ou de l’utilisation concernée, sous réserve des dispositions impératives du droit applicable.',
          ],
        },
        {
          title: '1. Responsable du traitement',
          paragraphs: [
            'Les traitements de données à caractère personnel mis en œuvre dans le cadre du site qory.fr et du service Qory sont effectués sous la responsabilité de la société Paratore Group, société par actions simplifiée unipersonnelle (SASU), dont le siège social est situé 329 chemin du Gay, 38500 La Buisse, France, immatriculée sous le numéro SIREN 992 066 357 et au RCS de Grenoble, joignable à l’adresse suivante : contact@paratoregroup.com.',
            'Dans le cadre de la présente politique, l’expression « responsable du traitement » désigne la personne morale qui détermine les finalités et les moyens essentiels des traitements de données à caractère personnel mis en œuvre via le site ou le service.',
          ],
        },
        {
          title: '2. Principes généraux',
          paragraphs: [
            'Qory s’attache à traiter les données personnelles de manière licite, loyale et transparente, pour des finalités déterminées, explicites et légitimes, en veillant à limiter la collecte aux données strictement pertinentes au regard des usages réellement poursuivis. Les traitements sont mis en œuvre selon une logique de proportionnalité, de minimisation et de sécurité raisonnable, compte tenu de la nature du service, des fonctionnalités proposées, de l’environnement technique utilisé et des contraintes opérationnelles propres au service. Ces principes sont cohérents avec les exigences générales du RGPD rappelées par la CNIL dans ses ressources de conformité.',
          ],
        },
        {
          title: '3. Données personnelles susceptibles d’être collectées',
          paragraphs: [
            'Dans le cadre du fonctionnement du site et du service, Qory peut être amené à collecter ou traiter les catégories de données suivantes, selon les cas d’usage et les interactions effectivement réalisées par l’utilisateur.',
          ],
        },
        {
          title: '3.1. Données fournies directement par l’utilisateur',
          paragraphs: [
            'Lorsque l’utilisateur utilise le service, il peut être amené à fournir :',
          ],
          bullets: [
            'l’URL du site soumis à l’analyse ;',
            'certaines informations associées à la demande d’analyse ou à l’accès au rapport ;',
            'une adresse e-mail, lorsqu’elle est renseignée volontairement, notamment pour recevoir une notification, rejoindre une liste d’attente, solliciter le support ou recevoir certaines communications ;',
            'le contenu de tout message transmis à l’éditeur dans le cadre d’une prise de contact ou d’une demande d’assistance.',
          ],
        },
        {
          title: '3.2. Données générées dans le cadre du service',
          paragraphs: [
            'L’utilisation du service peut générer :',
          ],
          bullets: [
            'des scores ;',
            'des sous-scores ;',
            'des indicateurs techniques ou de visibilité ;',
            'des signaux de structure ;',
            'des observations analytiques ;',
            'des priorités ;',
            'des recommandations ;',
            'des éléments composant le rapport restitué à l’utilisateur.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'Ces éléments peuvent, selon les cas, être rattachés à une commande, à une session, à une URL analysée ou à un accès spécifique au service.',
          ],
        },
        {
          title: '3.3. Données techniques et journaux',
          paragraphs: [
            'Qory peut également traiter certaines données techniques, notamment :',
          ],
          bullets: [
            'l’adresse IP ;',
            'le type d’appareil, de navigateur ou de système ;',
            'des informations de connexion ;',
            'des horodatages ;',
            'des journaux d’accès, d’erreur, de sécurité ou d’exécution ;',
            'des événements techniques liés au bon fonctionnement du service, à la prévention des abus, à la détection d’incidents ou à la protection de l’infrastructure.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'La CNIL rappelle que les responsables de traitement peuvent traiter de telles données dans la mesure où cela est nécessaire au fonctionnement, à la sécurité, à la maintenance et à la gestion du service, sous réserve du respect des règles applicables.',
          ],
        },
        {
          title: '3.4. Données de paiement',
          paragraphs: [
            'Les paiements sont traités par un prestataire de paiement tiers. Qory ne collecte ni ne conserve les numéros complets de carte bancaire. En revanche, Qory peut conserver certaines références de transaction, statuts de paiement, identifiants techniques de commande ou éléments comptables nécessaires à la gestion administrative, contractuelle, comptable et probatoire des opérations réalisées. La conservation des pièces comptables et justificatives pendant dix ans résulte du Code de commerce.',
          ],
        },
        {
          title: '4. Finalités des traitements et bases légales',
          paragraphs: [
            'Les données personnelles sont traitées pour des finalités déterminées. À chaque finalité correspond une base légale, conformément au RGPD.',
          ],
        },
        {
          title: '4.1. Exécution du contrat ou de mesures précontractuelles',
          paragraphs: [
            'Certaines données sont traitées afin :',
          ],
          bullets: [
            'de permettre la réalisation de l’analyse demandée ;',
            'de générer, rendre accessible et restituer le rapport commandé ;',
            'de gérer la commande, le paiement, la confirmation, l’accès au rapport et le support lié au service ;',
            'de répondre à une demande directement liée à l’usage du service.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'Ces traitements reposent sur la nécessité de l’exécution du contrat ou, le cas échéant, sur l’exécution de mesures précontractuelles prises à la demande de la personne concernée. La CNIL rappelle que cette base légale est appropriée lorsque le traitement est nécessaire à la fourniture du service demandé.',
          ],
        },
        {
          title: '4.2. Intérêt légitime',
          paragraphs: [
            'Certaines données sont traitées afin :',
          ],
          bullets: [
            'd’assurer la sécurité du site et du service ;',
            'de prévenir les abus, usages frauduleux, détournés ou anormaux ;',
            'de maintenir la disponibilité, la stabilité et la qualité technique du service ;',
            'de diagnostiquer des incidents ;',
            'd’améliorer la fiabilité, la robustesse et la performance du service ;',
            'de conserver une trace de certaines opérations à des fins de preuve, de prévention ou de défense de droits.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'Ces traitements reposent sur l’intérêt légitime de l’éditeur à protéger son service, sécuriser son activité, prévenir les comportements abusifs et améliorer le fonctionnement général du site, sous réserve de ne pas porter une atteinte disproportionnée aux droits et libertés des personnes concernées. La CNIL présente l’intérêt légitime comme une base possible lorsqu’un équilibre raisonnable est respecté.',
          ],
        },
        {
          title: '4.3. Consentement',
          paragraphs: [
            'Certaines données peuvent être traitées sur la base du consentement, notamment lorsque l’utilisateur :',
          ],
          bullets: [
            's’inscrit volontairement à une liste d’attente ;',
            'demande à recevoir certaines communications non strictement nécessaires au service ;',
            'accepte, le cas échéant, des traceurs ou fonctionnalités qui ne sont pas strictement nécessaires au fonctionnement du site.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'Lorsque le consentement constitue la base légale, l’utilisateur peut le retirer à tout moment, sans que cela n’affecte la licéité du traitement effectué antérieurement à ce retrait. La CNIL rappelle que les traitements fondés sur le consentement doivent permettre un retrait aussi simple que l’acceptation.',
          ],
        },
        {
          title: '4.4. Obligations légales',
          paragraphs: [
            'Enfin, certaines données peuvent être conservées ou traitées afin de satisfaire aux obligations légales ou réglementaires applicables à l’éditeur, notamment en matière comptable, fiscale, probatoire ou de réponse à une demande légalement fondée d’une autorité compétente.',
          ],
        },
        {
          title: '5. Cookies, traceurs et technologies similaires',
          paragraphs: [
            'Le site peut recourir à des cookies, traceurs ou technologies similaires. La CNIL rappelle que, conformément aux règles ePrivacy, certains traceurs nécessitent le consentement préalable, tandis que d’autres peuvent en être exemptés lorsqu’ils sont strictement nécessaires à la fourniture du service expressément demandé par l’utilisateur ou à l’établissement de la communication.',
            'À la date de mise à jour de la présente politique, Qory n’a pas vocation à utiliser de traceurs publicitaires ou de traceurs de profilage à des fins publicitaires comportementales. Des traceurs strictement nécessaires peuvent toutefois être déposés ou lus, notamment pour :',
          ],
          bullets: [
            'assurer la sécurité du site ;',
            'maintenir une session ;',
            'garantir certaines fonctionnalités essentielles ;',
            'permettre le bon fonctionnement technique du service ;',
            'prévenir des usages anormaux ou frauduleux.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'Ces traceurs, lorsqu’ils sont strictement nécessaires, peuvent être exemptés de consentement dans les conditions prévues par la réglementation et rappelées par la CNIL. Si l’usage de traceurs soumis à consentement venait à évoluer, un mécanisme d’information et de recueil du consentement conforme serait mis en place.',
          ],
        },
        {
          title: '6. Destinataires des données et sous-traitants',
          paragraphs: [
            'Les données personnelles collectées ou générées peuvent être accessibles, dans la limite de leurs attributions respectives et selon le strict besoin d’en connaître :',
          ],
          bullets: [
            'aux personnes habilitées au sein de Paratore Group ;',
            'aux prestataires techniques intervenant pour le compte de l’éditeur ;',
            'aux sous-traitants ou fournisseurs de services nécessaires au fonctionnement du site et du service ;',
            'et, le cas échéant, aux autorités légalement habilitées.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'Qory peut notamment s’appuyer sur les catégories de prestataires suivantes :',
          ],
          bullets: [
            'un prestataire de paiement tel que Stripe pour le traitement des paiements ;',
            'un prestataire d’infrastructure ou de base de données tel que Supabase pour certaines fonctions applicatives et de stockage ;',
            'un hébergeur ou fournisseur d’infrastructure tel que Vercel ;',
            'des prestataires techniques ou fournisseurs d’API liés à l’analyse, à la génération ou à la structuration de certains résultats ;',
            'des outils d’observabilité, de sécurité, de journalisation, de mesure ou d’assistance, le cas échéant.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'La CNIL rappelle que les sous-traitants traitant des données pour le compte du responsable du traitement ont des obligations spécifiques en matière de sécurité, de confidentialité et d’encadrement contractuel.',
          ],
        },
        {
          title: '7. Transferts de données hors de l’Espace économique européen',
          paragraphs: [
            'Certains prestataires ou sous-traitants utilisés par Qory peuvent être situés hors de l’Espace économique européen, notamment aux États-Unis, ou y transférer tout ou partie des données qu’ils traitent. Lorsque de tels transferts interviennent, Qory veille à ce qu’ils soient encadrés par des garanties appropriées, telles que des clauses contractuelles types, une décision d’adéquation ou tout autre mécanisme reconnu par le droit applicable.',
            'L’utilisateur est informé que le recours à des prestataires technologiques internationaux peut, selon les cas, impliquer un traitement de certaines données depuis des infrastructures ou par des sociétés établies hors de l’EEE. L’éditeur s’attache, dans la mesure du possible et compte tenu de la structure du service, à sélectionner des prestataires offrant des engagements de sécurité et de conformité adaptés. La CNIL rappelle que les transferts hors EEE doivent être encadrés par des garanties adéquates lorsqu’aucune décision d’adéquation n’est applicable.',
          ],
        },
        {
          title: '8. Durées de conservation',
          paragraphs: [
            'Les données personnelles ne sont pas conservées indéfiniment. Elles le sont pendant une durée proportionnée à la finalité poursuivie, sous réserve des obligations légales ou réglementaires imposant une conservation plus longue.',
            'À titre indicatif, Qory applique ou entend appliquer les principes suivants :',
          ],
          bullets: [
            'les données liées à une analyse, à un rapport ou à l’accès au service sont conservées pendant la durée nécessaire à la fourniture du service, à la gestion de la relation avec l’utilisateur et à la résolution d’éventuelles contestations, puis supprimées ou anonymisées dans un délai raisonnable, et au plus tard, sauf nécessité particulière, dans un délai d’environ 12 mois à compter de la dernière utilisation pertinente ;',
            'les données liées à une liste d’attente, à une demande de notification ou à certaines communications fondées sur le consentement sont conservées jusqu’au retrait du consentement, à la désinscription ou à la demande de suppression ;',
            'les journaux techniques et de sécurité sont conservés pour une durée limitée compatible avec les finalités de sécurité, de diagnostic et de prévention des abus, et en principe dans une limite d’environ 12 mois, sauf nécessité particulière ;',
            'les éléments comptables, références de transaction et pièces justificatives sont conservés pendant les durées légales applicables, notamment dix ans pour les pièces comptables et justificatives.',
          ],
        },
        {
          title: '9. Sécurité',
          paragraphs: [
            'Qory met en œuvre des mesures techniques et organisationnelles raisonnables destinées à assurer un niveau de sécurité approprié au regard des risques présentés par les traitements mis en œuvre, en tenant compte notamment de la nature des données, des fonctionnalités proposées, de l’architecture du service, de l’état des connaissances techniques et des contraintes opérationnelles. La CNIL rappelle que la sécurité constitue une obligation continue du responsable du traitement et de ses sous-traitants.',
            'Toutefois, aucun système d’information, aucun service en ligne, aucune transmission sur internet ni aucune infrastructure technique ne pouvant garantir une sécurité absolue, Qory ne saurait promettre l’absence totale de vulnérabilité, d’accès non autorisé, d’incident, d’altération, de perte ou de fuite affectant des données, même si des précautions raisonnables sont prises.',
          ],
        },
        {
          title: '10. Vos droits',
          paragraphs: [
            'Conformément au RGPD et aux informations rappelées par la CNIL, les personnes concernées disposent de droits leur permettant de conserver la maîtrise de leurs données personnelles. Ces droits incluent notamment :',
          ],
          bullets: [
            'le droit d’accès ;',
            'le droit de rectification ;',
            'le droit à l’effacement ;',
            'le droit à la limitation du traitement ;',
            'le droit d’opposition ;',
            'le droit à la portabilité ;',
            'ainsi que, lorsque le traitement repose sur le consentement, le droit de retirer ce consentement à tout moment.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'Le droit d’accès permet notamment de savoir si des données vous concernant sont traitées et d’en obtenir une copie dans un format compréhensible. La CNIL rappelle également que le responsable du traitement doit expliquer concrètement comment exercer ces droits et répondre en principe dans un délai d’un mois.',
          ],
        },
        {
          title: '11. Exercice des droits',
          paragraphs: [
            'Pour exercer vos droits ou poser toute question relative au traitement de vos données personnelles, vous pouvez contacter Qory à l’adresse suivante :',
            'contact@paratoregroup.com',
            'Afin de permettre le traitement correct de votre demande, il pourra vous être demandé, lorsque cela est nécessaire et proportionné, de fournir tout élément permettant de confirmer votre identité ou de préciser l’objet de votre demande. Conformément aux règles rappelées par la CNIL, une réponse est en principe apportée dans un délai d’un mois, sauf prolongation légale dûment justifiée.',
          ],
        },
        {
          title: '12. Réclamation auprès de la CNIL',
          paragraphs: [
            'Si vous estimez, après avoir contacté Qory, que vos droits ne sont pas respectés ou que le traitement mis en œuvre n’est pas conforme aux règles applicables en matière de protection des données, vous pouvez introduire une réclamation auprès de la Commission nationale de l’informatique et des libertés (CNIL), via son site internet officiel. La CNIL est l’autorité de contrôle compétente en France en matière de protection des données personnelles.',
          ],
        },
        {
          title: '13. Évolution de la politique de confidentialité',
          paragraphs: [
            'La présente politique peut être mise à jour à tout moment afin de refléter des évolutions légales, réglementaires, techniques, fonctionnelles ou organisationnelles, ainsi que toute évolution du site, du service ou des prestataires utilisés. La date de dernière mise à jour figure en tête de page. En cas de modification substantielle affectant la manière dont les données sont traitées ou les droits des personnes, Qory pourra, lorsque cela apparaît nécessaire ou approprié, informer les utilisateurs par tout moyen approprié.',
          ],
        },
      ]}
      seoPath="/confidentialite"
      seoDescription={pageDescription}
    />
  );
}
