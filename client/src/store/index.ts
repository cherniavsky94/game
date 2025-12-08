import { CharacterType, GameState } from 'shared/types';

type Listener = (state: ClientState) => void;

export interface ClientState {
  user: any | null;
  token: string | null;
  characters: CharacterType[];
  currentCharacterId: string | null;
  colyseus?: Partial<GameState> | null;
  loading: boolean;
  error?: string | null;
}

const initialState: ClientState = {
  user: null,
  token: null,
  characters: [],
  currentCharacterId: null,
  colyseus: null,
  loading: false,
  error: null,
};

class Store {
  private state: ClientState = { ...initialState };
  private listeners = new Set<Listener>();

  getState() {
    return this.state;
  }

  setState(patch: Partial<ClientState>) {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    // immediately call with current state
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const l of Array.from(this.listeners)) {
      try {
        l(this.state);
      } catch (e) {
        console.error('Store listener error', e);
      }
    }
  }

  // convenience methods
  setUser(user: any, token?: string | null) {
    this.setState({ user, token: token ?? this.state.token });
  }

  clearAuth() {
    this.setState({ user: null, token: null, characters: [], currentCharacterId: null });
  }

  setCharacters(chars: CharacterType[]) {
    this.setState({ characters: chars });
  }

  addCharacter(c: CharacterType) {
    this.setState({ characters: [...this.state.characters, c] });
  }

  updateCharacter(c: CharacterType) {
    this.setState({ characters: this.state.characters.map(x => x.id === c.id ? c : x) });
  }

  removeCharacter(id: string) {
    this.setState({ characters: this.state.characters.filter(x => x.id !== id) });
  }

  setCurrentCharacter(id: string | null) {
    this.setState({ currentCharacterId: id });
  }

  setColyseusState(state: Partial<GameState> | null) {
    this.setState({ colyseus: state });
  }
}

export const store = new Store();

export default store;
