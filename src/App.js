// src/App.js

import React, { useState, useEffect } from 'react';
import { fetchPokemons, fetchPokemonDetails, fetchPokemonAdditionalDetails, getPokemonImage } from './api';
import './App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [descriptions, setDescriptions] = useState({});
  const [images, setImages] = useState({});
  const [additionalDetails, setAdditionalDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPokemons = async () => {
      try {
        const initialData = await fetchPokemons(0, 50);
        setPokemons(initialData);
        setFilteredPokemons(initialData);

        const additionalData = await fetchPokemons(50, 30);
        const allPokemons = [...initialData, ...additionalData];
        setPokemons(allPokemons);
        setFilteredPokemons(allPokemons);

        const detailsPromises = allPokemons.map(pokemon =>
          Promise.all([
            fetchPokemonDetails(pokemon.name),
            fetchPokemonAdditionalDetails(pokemon.name)
          ]).then(([description, additional]) => ({
            name: pokemon.name,
            description,
            id: pokemon.url.split('/')[6],
            ...additional
          }))
        );

        const detailsData = await Promise.all(detailsPromises);
        const descriptionsMap = detailsData.reduce((acc, item) => {
          acc[item.name] = item.description;
          return acc;
        }, {});

        const imagesMap = detailsData.reduce((acc, item) => {
          acc[item.name] = getPokemonImage(item.id);
          return acc;
        }, {});

        const additionalDetailsMap = detailsData.reduce((acc, item) => {
          const abilitiesTranslated = item.abilities.map(ability => {
            switch (ability) {
              case 'overgrow': return 'Sobrecrescimento';
              case 'blaze': return 'Chama';
              case 'torrent': return 'Torrente';
              case 'shield-dust': return 'Pó de Escudo';
              case 'run-away': return 'Fuga';
              default: return ability;
            }
          }).join(', ');

          acc[item.name] = `
            <strong>Habilidades:</strong> ${abilitiesTranslated} <br>
            <strong>Tipos:</strong> ${item.types.join(', ')} <br>
            <strong>Altura:</strong> ${item.height / 10} m <br>
            <strong>Peso:</strong> ${item.weight / 10} kg
          `;
          return acc;
        }, {});

        setDescriptions(descriptionsMap);
        setImages(imagesMap);
        setAdditionalDetails(additionalDetailsMap);
        setLoading(false);
      } catch (err) {
        console.error('Erro detalhado:', err);
        setError('Falha ao buscar dados dos Pokémon.');
        setLoading(false);
      }
    };

    loadPokemons();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    const filtered = pokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredPokemons(filtered);
  };

  const handlePokemonClick = (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleCloseDetails = () => {
    setSelectedPokemon(null);
  };

  return (
    <div className="pokemon-container">
      <h1 className="app-title">Pokémon Explorer</h1>
      <input
        type="text"
        className="search-input"
        placeholder="Pesquisar Pokémon..."
        value={searchQuery}
        onChange={handleSearch}
      />
      {loading && <div className="loading">Carregando...</div>}
      {error && <div className="error">{error}</div>}
      <ul className="pokemon-list">
        {filteredPokemons.map(pokemon => (
          <li key={pokemon.name} onClick={() => handlePokemonClick(pokemon)}>
            <img src={images[pokemon.name]} alt={pokemon.name} className="pokemon-image" />
            <div>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</div>
          </li>
        ))}
      </ul>
      {selectedPokemon && (
        <div className="pokemon-details">
          <button className="close-button" onClick={handleCloseDetails}>×</button>
          <h2>{selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}</h2>
          <img src={images[selectedPokemon.name]} alt={selectedPokemon.name} className="pokemon-image-large" />
          <div dangerouslySetInnerHTML={{ __html: additionalDetails[selectedPokemon.name] }} />
          <div dangerouslySetInnerHTML={{ __html: descriptions[selectedPokemon.name] }} />
        </div>
      )}
    </div>
  );
}

export default App;
