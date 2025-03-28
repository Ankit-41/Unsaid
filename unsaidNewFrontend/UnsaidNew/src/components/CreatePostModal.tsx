import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { usePostContext } from "@/context/PostContext";
import { Image, Plus, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { addPost } = usePostContext();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const [spicyLevel, setSpicyLevel] = useState(3);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (content.trim()) {
      setIsSubmitting(true);
      try {
        console.log("Submitting post with:", {
          content,
          image: selectedFile,
          imageUrl: previewUrl,
          spicyLevel,
          isAnonymous
        });
        
        // Determine how to handle the image
        let imageToSend = null;
        if (selectedFile) {
          // If we have a file from the file input, use that
          imageToSend = selectedFile;
        } else if (previewUrl && !selectedFile) {
          // If we have a URL but no file, we need to convert the URL to a file
          console.log("Warning: Image URLs are not supported directly, only local file uploads");
          // We could fetch the image and convert to a blob here if needed
        }
        
        await addPost({
          content,
          image: imageToSend,
          spicyLevel,
          isAnonymous,
        });
        resetForm();
        onClose();
      } catch (error) {
        console.error("Error submitting post:", error);
        toast({
          title: "Error creating post",
          description: "Failed to create post. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setContent("");
    setSelectedFile(null);
    setImageUrl("");
    setPreviewUrl("");
    setIsPreviewLoaded(false);
    setSpicyLevel(3);
    setIsAnonymous(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImageUrl("");
      setIsPreviewLoaded(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (selectedFile) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setImageUrl("");
    setPreviewUrl("");
    setIsPreviewLoaded(false);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    
    // Don't set preview URL for empty value
    if (!e.target.value.trim()) {
      setPreviewUrl("");
      return;
    }
    
    // Only external URLs are supported, so we're keeping this feature
    // but the backend needs the actual file to upload to Cloudinary
    setPreviewUrl(e.target.value);
    setSelectedFile(null);
    setIsPreviewLoaded(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts or images with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
          />

          {!previewUrl && (
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 button-interaction h-20"
                onClick={handleUploadClick}
              >
                <Upload size={18} />
                <span className="text-sm">Upload from device</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </Button>
              
              <div className="col-span-1">
                <Label className="text-sm mb-1 block">Or enter image URL</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter image URL"
                    className="flex-1"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                  />
                </div>
              </div>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Image Preview</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="h-8 w-8"
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="relative w-full h-48 rounded-md overflow-hidden border border-border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className={cn(
                    "w-full h-full object-cover",
                    isPreviewLoaded ? "loaded" : "loading"
                  )}
                  onLoad={() => setIsPreviewLoaded(true)}
                  onError={() => {
                    setPreviewUrl("");
                    setIsPreviewLoaded(false);
                  }}
                />
                {!isPreviewLoaded && (
                  <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center">
                    <span className="text-muted-foreground">Loading preview...</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Spicy Level Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="spicy-level" className="text-sm">
                Spicy Level
              </Label>
              <div className="flex items-center">
                {Array(5).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-2 w-2 rounded-full mx-0.5",
                      i < spicyLevel ? "bg-red-500" : "bg-secondary"
                    )}
                  />
                ))}
              </div>
            </div>
            <Slider 
              id="spicy-level"
              min={1} 
              max={5} 
              step={1} 
              value={[spicyLevel]}
              onValueChange={(value) => setSpicyLevel(value[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Mild</span>
              <span>Medium</span>
              <span>Very Spicy</span>
            </div>
          </div>
          
          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous-mode" className="text-sm">
                Post Anonymously
              </Label>
              <p className="text-xs text-muted-foreground">
                Hide your identity from other users
              </p>
            </div>
            <Switch 
              id="anonymous-mode"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
