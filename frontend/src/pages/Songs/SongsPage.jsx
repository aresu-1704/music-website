import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { getTopTracks, searchTracks } from '../../services/spotifyService';

const SongsPage = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTopTracks();
  }, []);

  const loadTopTracks = async () => {
    try {
      const topTracks = await getTopTracks();
      setTracks(topTracks);
      setLoading(false);
    } catch (err) {
      console.error('Error loading top tracks:', err);
      setError('Failed to load tracks');
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchTracks(searchQuery);
      setTracks(results);
      setLoading(false);
    } catch (err) {
      console.error('Error searching tracks:', err);
      setError('Failed to search tracks');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error) return <div className="text-center text-danger p-5">{error}</div>;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Songs</h2>
      
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
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SongsPage; 