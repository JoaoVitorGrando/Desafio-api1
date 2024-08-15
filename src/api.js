
const API_BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemons = async (offset = 0, limit = 50) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar Pokémon:', error);
    throw error;
  }
};

export const fetchPokemonDetails = async (pokemonName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pokemon/${pokemonName}`);
    const data = await response.json();
    return `
      <strong>Descrição:</strong> ${data.flavor_text_entries.find(entry => entry.language.name === 'pt').flavor_text.replace(/[\n\r]/g, ' ')} <br>
      <strong>Altura:</strong> ${data.height / 10} m <br>
      <strong>Peso:</strong> ${data.weight / 10} kg
    `;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${pokemonName}:`, error);
    return 'Sem descrição disponível.';
  }
};

export const fetchPokemonAdditionalDetails = async (pokemonName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pokemon/${pokemonName}`);
    const data = await response.json();
    return {
      abilities: data.abilities.map(ability => ability.ability.name),
      types: data.types.map(type => type.type.name),
      height: data.height,
      weight: data.weight
    };
  } catch (error) {
    console.error(`Erro ao buscar detalhes adicionais do Pokémon ${pokemonName}:`, error);
    return {
      abilities: [],
      types: [],
      height: 0,
      weight: 0
    };
  }
};

export const getPokemonImage = (pokemonId) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
