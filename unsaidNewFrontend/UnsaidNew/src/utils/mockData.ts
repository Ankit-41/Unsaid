
export interface Comment {
  id: string;
  username: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  username: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  spicyLevel?: number;
  isAnonymous?: boolean;
}

const mockPosts: Post[] = [
  {
    id: "post-1",
    username: "rohan_sharma",
    content: "Just found out that the mess is serving pizza tonight! Everyone rush to the mess before it runs out! 🍕",
    timestamp: "2 hours ago",
    likes: 45,
    isLiked: false,
    spicyLevel: 2,
    comments: [
      {
        id: "comment-1",
        username: "anjali_gupta",
        content: "Thanks for the heads up! Already in the queue!",
        timestamp: "1 hour ago"
      },
      {
        id: "comment-2",
        username: "vikram_singh",
        content: "The pizza was amazing! Hope they serve it again next week.",
        timestamp: "45 minutes ago"
      }
    ]
  },
  {
    id: "post-2",
    username: "anonymous",
    content: "To the person who keeps playing loud music in Rajendra Bhawan at 2 AM - some of us have 8 AM classes. Please use headphones!",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
    timestamp: "5 hours ago",
    likes: 129,
    isLiked: true,
    spicyLevel: 4,
    isAnonymous: true,
    comments: [
      {
        id: "comment-3",
        username: "priya_patel",
        content: "Literally! I've been losing sleep because of this!",
        timestamp: "4 hours ago"
      },
      {
        id: "comment-4",
        username: "amit_kumar",
        content: "Have you tried talking to the warden?",
        timestamp: "3 hours ago"
      },
      {
        id: "comment-5",
        username: "zoya_khan",
        content: "I know exactly who this is talking about...",
        timestamp: "2 hours ago"
      }
    ]
  },
  {
    id: "post-3",
    username: "neha_sharma",
    content: "Just aced my Thermodynamics exam! All those late nights at the library finally paid off 🎉",
    timestamp: "1 day ago",
    likes: 87,
    isLiked: false,
    spicyLevel: 1,
    comments: [
      {
        id: "comment-6",
        username: "rahul_verma",
        content: "Congratulations! Any tips for someone who has it next semester?",
        timestamp: "20 hours ago"
      }
    ]
  },
  {
    id: "post-4",
    username: "anonymous",
    content: "Is anyone else noticing how biased Dr. Kapoor is towards the students who attend his extra classes? Almost feels like you need to go to those to get a good grade in the actual course.",
    timestamp: "2 days ago",
    likes: 56,
    isLiked: false,
    spicyLevel: 5,
    isAnonymous: true,
    comments: [
      {
        id: "comment-7",
        username: "anonymous",
        content: "100% agree! It's so unfair to students who have other commitments and can't attend.",
        timestamp: "1 day ago"
      },
      {
        id: "comment-8",
        username: "anonymous",
        content: "I've noticed this too. Someone should bring it up to the department.",
        timestamp: "1 day ago"
      }
    ]
  },
  {
    id: "post-5",
    username: "arjun_reddy",
    content: "Trying to organize a coding hackathon for first-year students. If you're interested in helping out, DM me!",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
    timestamp: "3 days ago",
    likes: 72,
    isLiked: true,
    spicyLevel: 2,
    comments: [
      {
        id: "comment-9",
        username: "divya_mathur",
        content: "This is such a great initiative! Count me in.",
        timestamp: "2 days ago"
      }
    ]
  }
];

export default mockPosts;
