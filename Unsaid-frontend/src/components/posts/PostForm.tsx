import React, { useState } from 'react';
import { postsAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import toast from 'react-hot-toast';
import { AlertCircle, Send } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface PostFormProps {
  onPostCreated?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const MAX_CHARS = 500;
  const remainingChars = MAX_CHARS - content.length;
  const isOverLimit = remainingChars < 0;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    
    if (isOverLimit) {
      toast.error(`Post exceeds maximum character limit of ${MAX_CHARS}`);
      return;
    }
    
    setLoading(true);
    
    try {
      await postsAPI.createPost({ content, isAnonymous });
      setContent('');
      setIsAnonymous(false);
      toast.success('Post submitted for approval');
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error: any) {
      console.error('Post creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="mb-6 border-primary/20 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Send className="h-4 w-4 mr-2" /> Share a Gossip
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="What's on your mind? Share your college gossip here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`min-h-[120px] resize-none transition-colors ${isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            maxLength={MAX_CHARS + 10} // Allow a bit over to show the error but prevent excessive typing
          />
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="anonymous" 
                checked={isAnonymous} 
                onCheckedChange={(checked: boolean | "indeterminate") => setIsAnonymous(checked === true)}
              />
              <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                Post anonymously
              </Label>
            </div>
            
            <span className={`text-xs ${
              remainingChars <= 20 
                ? remainingChars <= 0 
                  ? 'text-red-500 font-medium' 
                  : 'text-amber-500' 
                : 'text-gray-500'
            }`}>
              {remainingChars} characters remaining
            </span>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex items-start text-xs text-amber-600">
            <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <p>Your post will be reviewed by admins before being published</p>
          </div>
          <Button 
            type="submit" 
            disabled={loading || !content.trim() || isOverLimit}
            className="ml-4"
          >
            {loading ? 'Posting...' : 'Post Gossip'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PostForm;
