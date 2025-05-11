"use client";
import React, { useState } from "react";
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChallengeButtonProps = {
  username: string;
  highScore: number;
  referralCode: string;
};

const ChallengeButton= ({
  username,
  highScore,
  referralCode
}:ChallengeButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const challengeUrl = `${window.location.origin}?code=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(challengeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button 
        className="bg-[#00C2CB] hover:bg-[#00ADB5] text-white font-medium rounded-full px-6 py-2 flex items-center gap-2 shadow-md transition-all"
        onClick={() => setShowDialog(true)}
      >
        <Send className="h-4 w-4" /> Invite a Friend
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl border-0 shadow-xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-[#7B5BE6] text-xl font-bold">Challenge your friends!</DialogTitle>
            <DialogDescription className="text-[#8A8FB9]">
              Share this link to challenge your friends to beat your high score of <span className="font-bold text-[#7B5BE6]">{highScore}</span>!
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 mt-6">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">Challenge Link</Label>
              <Input
                id="link"
                readOnly
                value={challengeUrl}
                className="w-full border-[#E0E3FF] focus:border-[#7B5BE6] rounded-lg py-2 px-4"
              />
            </div>
            <Button 
              type="submit" 
              onClick={handleCopyLink} 
              className={`${copied ? 'bg-[#4CD964]' : 'bg-[#7B5BE6]'} text-white hover:opacity-90 rounded-lg px-4 py-2 font-medium transition-all`}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          
          <DialogFooter className="sm:justify-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="text-[#7B5BE6] border-[#E0E3FF] hover:bg-[#F5F6FF] rounded-lg px-6"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChallengeButton;
