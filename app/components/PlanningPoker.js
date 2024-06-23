'use client';
import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Mock server to simulate real-time behavior
const mockServer = {
  users: [],
  votes: {},
  listeners: [],

  addUser(name) {
    this.users.push(name);
    this.notifyListeners();
  },

  removeUser(name) {
    this.users = this.users.filter((user) => user !== name);
    delete this.votes[name];
    this.notifyListeners();
  },

  submitVote(name, value) {
    this.votes[name] = value;
    this.notifyListeners();
  },

  resetVotes() {
    this.votes = {};
    this.notifyListeners();
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },

  notifyListeners() {
    this.listeners.forEach((listener) => listener());
  },
};

const UserJoin = ({ username, setUsername, handleJoin, users }) => (
  <div className="mb-4 flex space-x-2">
    <Input
      type="text"
      placeholder="Enter your name"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="flex-grow"
    />
    <Button
      onClick={handleJoin}
      disabled={!username || users.includes(username)}
    >
      <UserPlus className="mr-2" />
      Join
    </Button>
  </div>
);

const TaskDescription = ({ taskDescription, setTaskDescription }) => (
  <div className="mb-4">
    <Input
      type="text"
      placeholder="Enter task description"
      value={taskDescription}
      onChange={(e) => setTaskDescription(e.target.value)}
      className="w-full"
    />
  </div>
);

const ControlButtons = ({ handleResetVotes }) => (
  <div className="mb-4 flex space-x-2">
    <Button onClick={handleResetVotes}>Reset Votes</Button>
  </div>
);

const VotingCards = ({
  pointValues,
  handleCardClick,
  selectedCard,
  username,
}) => (
  <div className="grid grid-cols-5 gap-4 mb-4">
    {pointValues.map((value) => (
      <Button
        key={value}
        onClick={() => handleCardClick(value)}
        className={`h-24 ${
          selectedCard === value ? 'bg-blue-500 text-white' : 'bg-gray-400'
        }`}
        disabled={!username}
      >
        {value}
      </Button>
    ))}
  </div>
);

const ParticipantsList = ({ users, votes, allVotesSubmitted }) => (
  <div className="mb-4">
    <h2 className="text-xl font-semibold mb-2">Participants</h2>
    <ul className="space-y-2">
      {users.map((user) => (
        <li
          key={user}
          className="flex items-center justify-between bg-gray-100 p-2 rounded"
        >
          <span>{user}</span>
          {allVotesSubmitted ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded">
              {votes[user]}
            </span>
          ) : votes[user] !== undefined ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded">
              Voted
            </span>
          ) : (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded">
              Waiting
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const VotingResults = ({ allVotesSubmitted, votes }) =>
  allVotesSubmitted && (
    <Alert>
      <AlertDescription>
        All votes submitted! Average vote:{' '}
        {(
          Object.values(votes).reduce((sum, vote) => sum + vote, 0) /
          Object.values(votes).length
        ).toFixed(1)}
      </AlertDescription>
    </Alert>
  );

const PlanningPoker = () => {
  const [taskDescription, setTaskDescription] = useState('');
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [votes, setVotes] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);

  const pointValues = [0, 1, 2, 3, 5, 8, 13, 20, 40, 100];

  useEffect(() => {
    const unsubscribe = mockServer.subscribe(() => {
      setUsers([...mockServer.users]);
      setVotes({ ...mockServer.votes });
    });

    return () => {
      unsubscribe();
      if (username) {
        mockServer.removeUser(username);
      }
    };
  }, [username]);

  const handleJoin = () => {
    if (username && !users.includes(username)) {
      mockServer.addUser(username);
    }
  };

  const handleCardClick = (value) => {
    setSelectedCard(value);
    if (username) {
      mockServer.submitVote(username, value);
    }
  };

  const handleResetVotes = () => {
    mockServer.resetVotes();
    setSelectedCard(null);
  };

  const allVotesSubmitted =
    users.length > 0 && users.every((user) => votes[user] !== undefined);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Planning Poker</h1>

      <UserJoin
        username={username}
        setUsername={setUsername}
        handleJoin={handleJoin}
        users={users}
      />

      <TaskDescription
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
      />

      <ControlButtons handleResetVotes={handleResetVotes} />

      <VotingCards
        pointValues={pointValues}
        handleCardClick={handleCardClick}
        selectedCard={selectedCard}
        username={username}
      />

      <ParticipantsList
        users={users}
        votes={votes}
        allVotesSubmitted={allVotesSubmitted}
      />

      <VotingResults allVotesSubmitted={allVotesSubmitted} votes={votes} />
    </div>
  );
};

export default PlanningPoker;
