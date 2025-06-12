import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { getRecommendations, searchTracks, loginToSpotify } from '../services/spotifyService';

const DiscoverForm = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const recommendations = await getRecommendations();
      if (recommendations === null) {
        // User needs to authenticate
        loginToSpotify();
        return;
      }
      setTracks(recommendations);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const results = await searchTracks(searchQuery);
      if (results === null) {
        // User needs to authenticate
        loginToSpotify();
        return;
      }
      setTracks(results);
    } catch (err) {
      console.error('Error searching tracks:', err);
      setError('Failed to search tracks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Container className="py-5 text-center">
      <h3>Loading...</h3>
      <p>Please wait while we fetch your recommendations.</p>
    </Container>
  );

  if (error) return (
    <Container className="py-5 text-center">
      <h3 className="text-danger">Error</h3>
      <p>{error}</p>
      <Button variant="primary" onClick={loadRecommendations}>
        Try Again
      </Button>
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4">Discover</h2>
      
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Search for songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Button type="submit" variant="primary" className="w-100">
              Search
            </Button>
          </Col>
        </Row>
      </Form>

      {tracks.length === 0 ? (
        <div className="text-center py-5">
          <h3>No tracks found</h3>
          <p>Try searching for something else or check back later for recommendations.</p>
        </div>
      ) : (
        <Row>
          {tracks.map((track, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card>
                <Card.Img 
                  variant="top" 
                  src={track.album?.images[0]?.url} 
                  alt={track.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title>{track.name}</Card.Title>
                  <Card.Text>
                    {track.artists?.map(artist => artist.name).join(', ')}
                  </Card.Text>
                  <Card.Text className="text-muted">
                    Album: {track.album?.name}
                  </Card.Text>
                  {track.preview_url && (
                    <audio controls className="w-100">
                      <source src={track.preview_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default DiscoverForm;