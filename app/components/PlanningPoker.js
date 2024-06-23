'use client';
import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const PlanningPoker = () => {
  const [taskDescription, setTaskDescription] = useState('');
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [votes, setVotes] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);

  const pointValues = [0, 1, 2, 3, 5, 8, 13, 20, 40, 100];

  useEffect(() => {
    socket.on('users', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('votes', (updatedVotes) => {
      setVotes(updatedVotes);
    });

    return () => {
      socket.off('users');
      socket.off('votes');
    };
  }, []);

  const handleJoin = () => {
    if (username && !users.includes(username)) {
      socket.emit('join', username);
    }
  };

  const handleCardClick = (value) => {
    setSelectedCard(value);
    if (username) {
      socket.emit('vote', { username, value });
    }
  };

  const handleResetVotes = () => {
    socket.emit('reset');
    setSelectedCard(null);
  };

  const allVotesSubmitted =
    users.length > 0 && users.every((user) => votes[user] !== undefined);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Planning Poker</h1>

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

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Enter task description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="mb-4 flex space-x-2">
        <Button onClick={handleResetVotes}>Reset Votes</Button>
      </div>

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

      {allVotesSubmitted && (
        <Alert>
          <AlertDescription>
            All votes submitted! Average vote:{' '}
            {(
              Object.values(votes).reduce((sum, vote) => sum + vote, 0) /
              Object.values(votes).length
            ).toFixed(1)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PlanningPoker;
