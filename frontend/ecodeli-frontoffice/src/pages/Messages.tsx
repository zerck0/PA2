import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';

const Messages: React.FC = () => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return (
      <Container className="py-5 page-content">
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Vous devez être connecté pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5 page-content">
      <h2 className="mb-4">Messages</h2>
      
      <Row>
        <Col md={4}>
          <Card className="border-0 shadow-sm mb-4 mb-md-0">
            <Card.Header className="bg-white border-bottom-0 py-3">
              <h5 className="mb-0">Boîte de réception</h5>
            </Card.Header>
            <Card.Body className="py-5 text-center text-muted">
              <i className="bi bi-inbox display-4 mb-3"></i>
              <p>Aucun message</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">
            <i className="bi bi-envelope-open display-1 mb-3"></i>
            <h5>Votre messagerie est vide</h5>
            <p className="text-center">
              Les messages de vos contacts et notifications importantes apparaîtront ici.
              Créez des annonces pour commencer à recevoir des messages !
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Messages;
