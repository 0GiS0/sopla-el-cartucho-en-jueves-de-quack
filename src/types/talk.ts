export type SessionType = 'episode';
export type SessionLanguage = 'es';

export type Speaker = {
  name: string;
  role: string;
  avatarUrl: string;
};

export type Session = {
  id: string;
  title: string;
  description: string;
  speakers: Speaker[];
  date: string;
  videoUrl: string;
  thumbnailUrl: string;
  type: SessionType;
  language: SessionLanguage;
  tags: string[];
};

export type SessionsFile = {
  show: {
    name: string;
    channel: string;
    channelUrl: string;
  };
  sessions: Session[];
};

export type AssetsFile = {
  assets: Array<{
    sessionId: string;
    cover?: string;
    avatar8bit?: string;
    avatarOriginal?: string;
  }>;
};

export type SessionWithAssets = Session & {
  assets?: AssetsFile['assets'][number];
};
