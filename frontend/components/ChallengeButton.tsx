"use client";
import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChallengeButtonProps = {
  username: string;
  highScore: number;
  referralCode: string;
};

const ChallengeButton = ({
  username,
  highScore,
  referralCode,
}: ChallengeButtonProps) => {
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
        className="bg-[#6AB999] cursor-pointer  hover:bg-[#4f9f80] text-xl text-white font-medium px-6 py-6 flex items-center gap-2 shadow-md transition-all"
        onClick={() => setShowDialog(true)}
      >
        <Send className="h-4 w-4" /> Invite a Friend
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl border-0 shadow-xl px-6 py-2">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-[#6AB999] text-xl font-bold">
              Challenge your friends!
            </DialogTitle>
            <DialogDescription className="text-[#8A8FB9] text-base">
              Share this link to challenge your friends to beat your high score of{" "}
              <span className="font-bold text-[#6AB999]">{highScore}</span>!
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Challenge Link
              </Label>
              <Input
                id="link"
                readOnly
                value={challengeUrl}
                className="w-full border-[#E0E3FF] focus:border-[#6AB999] rounded-lg py-2 px-4 text-sm"
              />
            </div>
            <Button
              type="submit"
              onClick={handleCopyLink}
              className={`${
                copied ? "bg-[#4CD964]" : "bg-[#6AB999]"
              } text-white  hover:bg-[#4f9f80]  rounded-lg px-4 py-2 font-medium transition-all text-sm`}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <DialogFooter className="sm:justify-center ">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="text-[#6AB999] border-[#E0E3FF] hover:bg-[#F5F6FF] rounded-lg px-6 text-sm"
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
