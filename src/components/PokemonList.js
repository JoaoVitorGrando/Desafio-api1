// src/components/PokemonList.js
import React, { useState, useEffect } from 'react';
import { fetchPokemons, fetchPokemonDetails, getPokemonImage, fetchPokemonAdditionalDetails } from '../api';

const PokemonList = () => {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');git branch

  const [descriptions, setDescriptions] = useState({});
  const [images, setImages] = useState({});
  const [additionalDetails, setAdditionalDetails] = useState({});
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    const loadPokemons = async () => {
      try {
        // Buscar os primeiros 50 Pokémon
        const initialData = await fetchPokemons(0, 50);
        setPokemons(initialData);
        setFilteredPokemons(initialData);

        // Buscar mais 30 Pokémon (offset de 50 a 80)
        const additionalData = await fetchPokemons(50, 30);
        const allPokemons = [...initialData, ...additionalData];
        setPokemons(allPokemons);
        setFilteredPokemons(allPokemons);

        // Buscar detalhes para cada Pokémon
        const detailsPromises = allPokemons.map(pokemon =>
          Promise.all([
            fetchPokemonDetails(pokemon.name),
            fetchPokemonAdditionalDetails(pokemon.name)
          ]).then(([description, additional]) => ({
            name: pokemon.name,
            description,
            id: pokemon.url.split('/')[6],  // Extrair o ID da URL
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
              // Adicione outras habilidades conforme necessário
              default: return ability; // Se não houver tradução, manter o inglês
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
        setError('Falha ao buscar dados dos Pokémon.');
        setLoading(false);
      }
    };

    loadPokemons();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = pokemons.filter(pokemon =>
        pokemon.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPokemons(filtered);
    } else {
      setFilteredPokemons(pokemons);
    }
  }, [search, pokemons]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handlePokemonClick = async (pokemonName) => {
    // Exibir os detalhes do Pokémon clicado
    setSelectedPokemon(pokemonName);
  };

  const handleCloseDetails = () => {
    setSelectedPokemon(null);
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pokemon-container">
      <input
        type="text"
        placeholder="Pesquise um Pokémon..."
        value={search}
        onChange={handleSearchChange}
        className="search-input"
      />
      <ul className="pokemon-list">
        {filteredPokemons.length > 0 ? (
          filteredPokemons.map(pokemon => (
            <li key={pokemon.name} onClick={() => handlePokemonClick(pokemon.name)}>
              <img 
                src={images[pokemon.name]} 
                alt={pokemon.name} 
                className="pokemon-image"
              />
              <div>
                <strong>{pokemon.name}</strong>
                <p>{descriptions[pokemon.name]}</p>
              </div>
            </li>
          ))
        ) : (
          <li>Nenhum Pokémon encontrado</li>
        )}
      </ul>

      {selectedPokemon && (
        <div className="pokemon-details">
          <button className="close-button" onClick={handleCloseDetails}>X</button>
          <h2>{selectedPokemon}</h2>
          <img 
            src={images[selectedPokemon]} 
            alt={selectedPokemon} 
            className="pokemon-image-large"
          />
          <div dangerouslySetInnerHTML={{ __html: additionalDetails[selectedPokemon] }} />
        </div>
      )}
    </div>
  );
};

export default PokemonList;

