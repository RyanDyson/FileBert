import { WindowWrapper } from "@/components/global/window-wrapper";
import { Actions } from "@/components/global/toast-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useState, useEffect } from "react";
import {
  User,
  Settings as SettingsIcon,
  Code,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "../lib/utils";

type SettingsTab = "account" | "preferences" | "dev";

interface Question {
  id: number;
  text: string;
}

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (window.electronAPI?.getQuestions) {
        const loadedQuestions = await window.electronAPI.getQuestions();
        setQuestions(loadedQuestions);
      }
    };
    loadQuestions();
  }, []);

  const handleUpdateQuestions = async (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    if (window.electronAPI?.updateQuestions) {
      await window.electronAPI.updateQuestions(newQuestions);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
    };
    handleUpdateQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (id: number) => {
    handleUpdateQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id: number, text: string) => {
    handleUpdateQuestions(
      questions.map((q) => (q.id === id ? { ...q, text } : q))
    );
  };

  const handleSetAction = async (action: Actions) => {
    if (window.electronAPI?.setToastAction) {
      await window.electronAPI.setToastAction(action);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "account", label: "Account", icon: <User className="h-4 w-4" /> },
    {
      id: "preferences",
      label: "Preferences",
      icon: <SettingsIcon className="h-4 w-4" />,
    },
    { id: "dev", label: "Dev", icon: <Code className="h-4 w-4" /> },
  ];

  return (
    <WindowWrapper title="FileBert - Settings">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <div className="w-48 border-r border-[#b3b8be] bg-[#202532] flex flex-col">
          <div className="p-4 border-b border-[#b3b8be]/30">
            <h2 className="text-sm font-semibold text-white">Settings</h2>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {tab.icon}
                <span className="flex-1 text-left">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-auto bg-[#e6eaef]">
          {activeTab === "account" && (
            <div className="flex-1 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Account
              </h3>
              <div className="space-y-4 bg-white p-6 rounded-lg border border-[#b3b8be] shadow-sm">
                <div className="space-y-2">
                  <Label className="text-gray-600">Display Name</Label>
                  <Input
                    placeholder="Enter display name"
                    defaultValue="John Doe"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">Email</Label>
                  <Input
                    placeholder="Enter email"
                    defaultValue="john@example.com"
                    type="email"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">Account Status</Label>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white hover:bg-green-600">
                    Active
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="flex-1 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Preferences
              </h3>
              <div className="space-y-4 bg-white p-6 rounded-lg border border-[#b3b8be] shadow-sm">
                <div className="space-y-2">
                  <Label className="text-gray-600">Theme</Label>
                  <NativeSelect defaultValue="light">
                    <NativeSelectOption value="light">Light</NativeSelectOption>
                    <NativeSelectOption value="dark">Dark</NativeSelectOption>
                    <NativeSelectOption value="system">
                      System
                    </NativeSelectOption>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">Language</Label>
                  <NativeSelect defaultValue="en">
                    <NativeSelectOption value="en">English</NativeSelectOption>
                    <NativeSelectOption value="es">Spanish</NativeSelectOption>
                    <NativeSelectOption value="fr">French</NativeSelectOption>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">Notifications</Label>
                  <NativeSelect defaultValue="all">
                    <NativeSelectOption value="all">
                      All Notifications
                    </NativeSelectOption>
                    <NativeSelectOption value="important">
                      Important Only
                    </NativeSelectOption>
                    <NativeSelectOption value="none">None</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dev" && (
            <div className="flex-1 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Question Management
                </h3>
                <div className="bg-white p-6 rounded-lg border border-[#b3b8be] shadow-sm space-y-4">
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div key={question.id} className="flex gap-2">
                        <span className="flex items-center justify-center w-8 h-10 text-sm text-gray-500 font-mono bg-gray-50 rounded border border-gray-200">
                          {index + 1}
                        </span>
                        <Input
                          value={question.text}
                          onChange={(e) =>
                            handleQuestionChange(question.id, e.target.value)
                          }
                          placeholder="Enter question text..."
                          className="bg-white text-gray-900 border-gray-300"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleAddQuestion}
                    variant="outline"
                    className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Developer Tools
                </h3>
                <div className="space-y-4 bg-white p-6 rounded-lg border border-[#b3b8be] shadow-sm">
                  <div className="space-y-2">
                    <Label className="text-gray-600">Toast Actions</Label>
                    <div className="flex flex-col gap-2">
                      {Object.values(Actions).map((action) => (
                        <Button
                          key={action}
                          onClick={() => handleSetAction(action)}
                          variant="outline"
                          className="justify-start bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <Label className="text-gray-600">Windows</Label>
                    <Button
                      onClick={() => {
                        if (window.electronAPI?.openQuestionWindow) {
                          window.electronAPI.openQuestionWindow();
                        }
                      }}
                      variant="outline"
                      className="w-full justify-start bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200"
                    >
                      Open Question Window
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WindowWrapper>
  );
};
