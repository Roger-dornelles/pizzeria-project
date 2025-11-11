export const supabase = {
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://mock.url/file' } }),
    remove: jest.fn().mockResolvedValue({ error: null }),
  },
};
