import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge } from 'react-bootstrap';

interface Message {
  id: number;
  expediteur: string;
  expediteurId: number;
  destinataireId: number;
  sujet: string;
  contenu: string;
  dateEnvoi: string;
  lu: boolean;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler une requête API pour charger les messages
    setTimeout(() => {
      const mockMessages: Message[] = [
        {
          id: 1,
          expediteur: "Jean Dupont",
          expediteurId: 12,
          destinataireId: 1,
          sujet: "Livraison du colis #45689",
          contenu: "Bonjour,\n\nJe suis intéressé par votre annonce pour la livraison d'un colis de Paris à Lyon. Le colis est léger (2kg) et de petite taille. Serait-il possible de le livrer avant vendredi ?\n\nCordialement,\nJean",
          dateEnvoi: "2023-07-18T14:35:00",
          lu: false
        },
        {
          id: 2,
          expediteur: "Marie Lefort",
          expediteurId: 8,
          destinataireId: 1,
          sujet: "Question sur le service d'accompagnement",
          contenu: "Bonjour,\n\nJ'aurais besoin d'accompagner ma mère à un rendez-vous médical la semaine prochaine. Pourriez-vous me préciser vos disponibilités et tarifs ?\n\nMerci d'avance,\nMarie",
          dateEnvoi: "2023-07-15T09:12:00",
          lu: true
        },
        {
          id: 3,
          expediteur: "Support EcoDeli",
          expediteurId: 0,
          destinataireId: 1,
          sujet: "Bienvenue sur EcoDeli",
          contenu: "Bonjour et bienvenue sur EcoDeli !\n\nNous sommes ravis de vous compter parmi notre communauté d'utilisateurs. N'hésitez pas à découvrir toutes nos fonctionnalités pour faciliter vos livraisons et services.\n\nL'équipe EcoDeli",
          dateEnvoi: "2023-07-10T10:00:00",
          lu: true
        }
      ];
      
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectMessage = (message: Message) => {
    // Marquer le message comme lu
    setMessages(prev => 
      prev.map(m => m.id === message.id ? { ...m, lu: true } : m)
    );
    setSelectedMessage(message);
    setReplyText('');
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    // Simuler l'envoi d'une réponse
    alert(`Réponse envoyée à ${selectedMessage.expediteur}`);
    setReplyText('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Messages</h2>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des messages...</p>
        </div>
      ) : (
        <Row>
          <Col md={4}>
            <Card className="border-0 shadow-sm mb-4 mb-md-0">
              <Card.Header className="bg-white border-bottom-0 py-3">
                <h5 className="mb-0">Boîte de réception</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {messages.length === 0 ? (
                  <ListGroup.Item className="py-4 text-center text-muted">
                    Aucun message
                  </ListGroup.Item>
                ) : (
                  messages.map(message => (
                    <ListGroup.Item 
                      key={message.id}
                      action
                      active={selectedMessage?.id === message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={message.lu ? '' : 'fw-bold'}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-truncate">{message.expediteur}</span>
                        {!message.lu && (
                          <Badge bg="primary" pill>New</Badge>
                        )}
                      </div>
                      <div className="text-truncate small">{message.sujet}</div>
                      <small className="text-muted">{formatDate(message.dateEnvoi)}</small>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>
          </Col>
          <Col md={8}>
            {selectedMessage ? (
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-bottom-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{selectedMessage.sujet}</h5>
                  </div>
                  <div className="text-muted small mt-1">
                    De: {selectedMessage.expediteur} • {formatDate(selectedMessage.dateEnvoi)}
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="mb-4" style={{ whiteSpace: 'pre-line' }}>
                    {selectedMessage.contenu}
                  </div>
                  
                  <hr className="my-4" />
                  
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Votre réponse</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={4} 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tapez votre réponse ici..."
                      />
                    </Form.Group>
                    <div className="text-end">
                      <Button 
                        variant="primary" 
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                      >
                        Envoyer la réponse
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            ) : (
              <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">
                <i className="bi bi-envelope-open fs-1 mb-3"></i>
                <p>Sélectionnez un message pour afficher son contenu</p>
              </div>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Messages;