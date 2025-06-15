
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EditEventForm = ({ event }) => {
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description,
    location: event.location,
    dateTime: new Date(event.dateTime).toISOString().slice(0, 16),
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated event data:", formData);
    // Here you would typically call an API to update the event
    alert("Event details saved! Check the console for the data.");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">Description</Label>
        <Textarea id="description" value={formData.description} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">Location</Label>
        <Input id="location" value={formData.location} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dateTime" className="text-right">Date & Time</Label>
        <Input id="dateTime" type="datetime-local" value={formData.dateTime} onChange={handleChange} className="col-span-3" />
      </div>
      <Button type="submit" className="w-full">Save Changes</Button>
    </form>
  );
};

export default EditEventForm;
