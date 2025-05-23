'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../DataTable';
import playerService, { Player, CreatePlayerDto, UpdatePlayerDto, PlayerFilter } from '@/Services/PlayerService';
import teamService from '@/Services/TeamService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PlayerManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<PlayerFilter>({});

  // Form state
  const [formData, setFormData] = useState<CreatePlayerDto | UpdatePlayerDto>({
    fullName: '',
    knownName: '',
    position: '',
    shirtNumber: undefined,
    nationality: '',
    preferredFoot: undefined,
    teamId: undefined,
    photo: undefined
  });

  // File input state
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPlayers().then();
    fetchTeams().then();
  }, []);

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const data = await playerService.getPlayers(filter);
      setPlayers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch players');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await teamService.getAllTeams();
      setTeams(data);
    } catch (err: any) {
      console.error('Failed to fetch teams:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const files = e.target.files;
      if (files && files.length > 0) {
        setImageFile(files[0]);
        setFormData(prev => ({
          ...prev,
          photo: files[0]
        }));
      }
    } else {
      // Handle numeric values
      const processedValue = ['shirtNumber', 'teamId'].includes(name)
          ? value === '' ? undefined : Number(value)
          : value;

      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamChange = (value: string) => {
    const teamId = value === '_none' ? null : Number(value);
    setFormData(prev => ({
      ...prev,
      teamId
    }));
  };

  const handleFilterChange = (name: keyof PlayerFilter, value: any) => {
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const handleFilterApply = () => {
    fetchPlayers().then();
  };

  const handleFilterReset = () => {
    setFilter({});
    fetchPlayers().then();
  };

  const handleEditClick = (player: Player) => {
    setSelectedPlayer(player);
    setFormData({
      fullName: player.fullName,
      knownName: player.knownName || '',
      position: player.position,
      shirtNumber: player.shirtNumber,
      nationality: player.nationality || '',
      preferredFoot: player.preferredFoot,
      teamId: player.teamId
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteClick = async (player: Player) => {
    if (window.confirm(`Are you sure you want to delete ${player.fullName}?`)) {
      try {
        await playerService.deletePlayer(player.id);
        setSuccess(`${player.fullName} has been deleted successfully.`);
        await fetchPlayers();
      } catch (err: any) {
        setError(err.message || `Failed to delete ${player.fullName}`);
      }
    }
  };

  const handleCreateClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && selectedPlayer) {
        await playerService.updatePlayer(selectedPlayer.id, formData as UpdatePlayerDto);
        setSuccess(`${formData.fullName} has been updated successfully.`);
      } else {
        await playerService.createPlayer(formData as CreatePlayerDto);
        setSuccess(`${formData.fullName} has been created successfully.`);
      }

      // Reset form and close it
      resetForm();
      setShowForm(false);

      // Update the players list
      await fetchPlayers();
    } catch (err: any) {
      setError(err.message || 'Failed to save player');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      knownName: '',
      position: '',
      shirtNumber: undefined,
      nationality: '',
      preferredFoot: undefined,
      teamId: undefined,
      photo: undefined
    });
    setImageFile(null);
    setSelectedPlayer(null);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    resetForm();
    setShowForm(false);
  };

  // Table columns
  const columns = [
    {key: 'id', label: 'ID'},
    { key: 'photo', label: 'Photo', render: (player: Player) => player.photoUrl ? (
          <img src={player.photoUrl} alt={player.fullName} className="w-16 h-16 rounded-full object-cover" />
      ) : 'No photo' },
    { key: 'fullName', label: 'Name' },
    { key: 'knownName', label: 'Known As' },
    { key: 'position', label: 'Position' },
    {key:'shirtNumber', label: 'Shirt Number'},
    {
      key: 'teamId',
      label: 'Team',
      render: (player: Player) => {
        const team = teams.find(t => t.id === player.teamId);
        return team ? team.name : 'No Team';
      }
    }
  ];

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500"
          >
            Player Management
          </motion.h2>
          <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
          >
            <Button
                onClick={handleCreateClick}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Player
            </Button>
          </motion.div>
        </div>

        {error && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
        )}

        {success && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
        )}

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border border-gray-700 p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm shadow-lg"
        >
          <h3 className="text-lg font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Filter Players
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Label htmlFor="filter-nationality" className="text-gray-300">Nationality</Label>
              <Input
                  id="filter-nationality"
                  value={filter.nationality || ''}
                  onChange={e => handleFilterChange('nationality', e.target.value)}
                  placeholder="Filter by nationality"
                  className="bg-gray-700/50 border-gray-600 text-gray-200"
              />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Label htmlFor="filter-foot" className="text-gray-300">Preferred Foot</Label>
              <Select
                  value={filter.preferredFoot || ''}
                  onValueChange={value => handleFilterChange('preferredFoot', value)}
              >
                <SelectTrigger id="filter-foot" className="bg-gray-700/50 border-gray-600 text-gray-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="_all">All</SelectItem>
                  <SelectItem value="Left">Left</SelectItem>
                  <SelectItem value="Right">Right</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
            >
              <Label htmlFor="filter-team" className="text-gray-300">Team</Label>
              <Select
                  value={filter.teamId?.toString() || ''}
                  onValueChange={value => handleFilterChange('teamId', value ? Number(value) : undefined)}
              >
                <SelectTrigger id="filter-team" className="bg-gray-700/50 border-gray-600 text-gray-200">
                  <SelectValue placeholder="All teams" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="_all">All teams</SelectItem>
                  {teams.map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </div>
          <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex space-x-2"
          >
            <Button
                onClick={handleFilterApply}
                className="bg-blue-600 hover:bg-blue-500 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Apply Filters
            </Button>
            <Button
                variant="outline"
                onClick={handleFilterReset}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </Button>
          </motion.div>
        </motion.div>

        {showForm && (
            <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.4 }}
                className="border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-medium mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                  {isEditing ? 'Edit Player' : 'Add New Player'}
                </h3>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="space-y-2"
                    >
                      <Label htmlFor="fullName" className="text-gray-300">Full Name *</Label>
                      <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName || ''}
                          onChange={handleInputChange}
                          required
                          className="bg-gray-700/50 border-gray-600 text-gray-200"
                      />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="space-y-2"
                    >
                      <Label htmlFor="knownName" className="text-gray-300">Known Name</Label>
                      <Input
                          id="knownName"
                          name="knownName"
                          value={formData.knownName || ''}
                          onChange={handleInputChange}
                          className="bg-gray-700/50 border-gray-600 text-gray-200"
                      />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="space-y-2"
                    >
                      <Label htmlFor="position" className="text-gray-300">Position *</Label>
                      <Select
                          value={formData.position || ''}
                          onValueChange={value => handleSelectChange('position', value)}
                      >
                        <SelectTrigger id="position" className="bg-gray-700/50 border-gray-600 text-gray-200">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="GK">Goalkeeper (GK)</SelectItem>
                          <SelectItem value="CB">Center Back (CB)</SelectItem>
                          <SelectItem value="RB">Right Back (RB)</SelectItem>
                          <SelectItem value="LB">Left Back (LB)</SelectItem>
                          <SelectItem value="RWB">Right Wing Back (RWB)</SelectItem>
                          <SelectItem value="LWB">Left Wing Back (LWB)</SelectItem>
                          <SelectItem value="RCB">Right Center Back (RCB)</SelectItem>
                          <SelectItem value="LCB">Left Center Back (LCB)</SelectItem>
                          <SelectItem value="CDM">Defensive Midfielder (CDM)</SelectItem>
                          <SelectItem value="CM">Central Midfielder (CM)</SelectItem>
                          <SelectItem value="RCM">Right Central Midfielder (RCM)</SelectItem>
                          <SelectItem value="LCM">Left Central Midfielder (LCM)</SelectItem>
                          <SelectItem value="CAM">Attacking Midfielder (CAM)</SelectItem>
                          <SelectItem value="RM">Right Midfielder (RM)</SelectItem>
                          <SelectItem value="LM">Left Midfielder (LM)</SelectItem>
                          <SelectItem value="RF">Right Forward (RF)</SelectItem>
                          <SelectItem value="LF">Left Forward (LF)</SelectItem>
                          <SelectItem value="SS">Second Striker (SS)</SelectItem>
                          <SelectItem value="CF">Center Forward (CF)</SelectItem>
                          <SelectItem value="LW">Left Winger (LW)</SelectItem>
                          <SelectItem value="RW">Right Winger (RW)</SelectItem>
                          <SelectItem value="ST">Striker (ST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 }}
                        className="space-y-2"
                    >
                      <Label htmlFor="shirtNumber" className="text-gray-300">Shirt Number</Label>
                      <Input
                          id="shirtNumber"
                          name="shirtNumber"
                          type="number"
                          value={formData.shirtNumber === undefined ? '' : formData.shirtNumber}
                          onChange={handleInputChange}
                          className="bg-gray-700/50 border-gray-600 text-gray-200"
                      />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="space-y-2"
                    >
                      <Label htmlFor="nationality" className="text-gray-300">Nationality</Label>
                      <Input
                          id="nationality"
                          name="nationality"
                          value={formData.nationality || ''}
                          onChange={handleInputChange}
                          className="bg-gray-700/50 border-gray-600 text-gray-200"
                      />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.35 }}
                        className="space-y-2"
                    >
                      <Label htmlFor="preferredFoot" className="text-gray-300">Preferred Foot</Label>
                      <Select
                          value={formData.preferredFoot || ''}
                          onValueChange={value => handleSelectChange('preferredFoot', value)}
                      >
                        <SelectTrigger id="preferredFoot" className="bg-gray-700/50 border-gray-600 text-gray-200">
                          <SelectValue placeholder="Select preferred foot" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="Left">Left</SelectItem>
                          <SelectItem value="Right">Right</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="space-y-2"
                    >
                      <Label htmlFor="teamId" className="text-gray-300">Team</Label>
                      <Select
                          value={formData.teamId?.toString() || ''}
                          onValueChange={handleTeamChange}
                      >
                        <SelectTrigger id="teamId" className="bg-gray-700/50 border-gray-600 text-gray-200">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="_none">No Team</SelectItem>
                          {teams.map(team => (
                              <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.45 }}
                        className="space-y-2 col-span-2"
                    >
                      <Label htmlFor="photo" className="text-gray-300">Player Photo</Label>
                      <div className="relative">
                        <Input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="bg-gray-700/50 border-gray-600 text-gray-200"
                        />
                        {imageFile && (
                            <div className="mt-2 inline-flex items-center text-sm text-green-400">
                              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {imageFile.name}
                            </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="flex justify-end space-x-3 pt-4"
                  >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelClick}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 transition-all duration-300"
                    >
                      {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                      ) : isEditing ? (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Update Player
                          </>
                      ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Player
                          </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
        )}

        <DataTable
            columns={columns}
            data={players}
            isLoading={isLoading}
            pagination
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
        />
      </div>
  );
};

export default PlayerManagement;