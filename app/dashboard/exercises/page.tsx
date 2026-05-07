"use client"
import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner" // Agar aap shadcn toast use kar rahe hain

export default function MemberExercisePage() {
  const [loading, setLoading] = useState(false);
  
  // 1. DATA: Weight field ko track karne ke liye update kiya
  const [exercises, setExercises] = useState([
    { id: 1, name: "Bench Press", sets: 3, reps: 12, weight: "", completed: false },
    { id: 2, name: "Squats", sets: 4, reps: 10, weight: "", completed: false },
    { id: 3, name: "Shoulder Press", sets: 3, reps: 12, weight: "", completed: false },
    { id: 4, name: "Deadlift", sets: 4, reps: 8, weight: "", completed: false },
    { id: 5, name: "Lat Pulldown", sets: 3, reps: 12, weight: "", completed: false },
    { id: 6, name: "Barbell Row", sets: 3, reps: 10, weight: "", completed: false },
    { id: 7, name: "Leg Press", sets: 4, reps: 12, weight: "", completed: false },
    { id: 8, name: "Bicep Curl", sets: 3, reps: 15, weight: "", completed: false },
    { id: 9, name: "Tricep Pushdown", sets: 3, reps: 15, weight: "", completed: false },
    { id: 10, name: "Plank", sets: 3, reps: 60, weight: "", completed: false },
  ]);

  const completedCount = exercises.filter(ex => ex.completed).length;
  const progressPercentage = (completedCount / exercises.length) * 100;

  const toggleExercise = (id: number) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
  };

  // Naya Function: Weight update karne ke liye
  const handleWeightChange = (id: number, value: string) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, weight: value } : ex
    ));
  };

  // --- FINISH SESSION LOGIC ---
  const onFinish = async () => {
    if (completedCount === 0) {
      return alert("Kam az kam ek exercise to poori karein!");
    }

    setLoading(true);
    try {
      const response = await fetch("/api/workout/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: "cmo75g2h60001ogueodxse7eh", // Yahan aap login user ki ID pass karenge
          progress: Math.round(progressPercentage),
          exercises: exercises.filter(ex => ex.completed), // Sirf completed wali bhejein
        }),
      });

      if (response.ok) {
        toast.success("Workout saved successfully!");
        // Optional: Redirect to dashboard
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Something went wrong while saving.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">My Workout</h1>
        <div className="flex justify-between text-sm font-medium">
          <span>Overall Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="space-y-4">
        {exercises.map((ex) => (
          <Card key={ex.id} className={ex.completed ? "bg-green-50 border-green-200" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={ex.completed} 
                  onCheckedChange={() => toggleExercise(ex.id)}
                />
                <div>
                  <p className={`font-bold ${ex.completed ? "line-through text-gray-400" : ""}`}>
                    {ex.name}
                  </p>
                  <p className="text-xs text-gray-500">{ex.sets} Sets x {ex.reps} Reps</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="KG" 
                  value={ex.weight}
                  onChange={(e) => handleWeightChange(ex.id, e.target.value)}
                  className="w-16 h-8 text-sm" 
                  disabled={ex.completed}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        onClick={onFinish}
        disabled={loading}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
      >
        {loading ? "SAVING..." : "FINISH SESSION"}
      </Button>
    </div>
  )
}
