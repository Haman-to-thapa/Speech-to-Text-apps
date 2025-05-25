import { baseApi } from './baseApi';

export const transcriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadAndTranscribe: builder.mutation({
      query: (audioFile) => {
        const formData = new FormData();
        formData.append('audio', audioFile);
        return {
          url: '/transcriptions',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Transcription'],
    }),
    
    getTranscriptions: builder.query({
      query: () => '/transcriptions',
      providesTags: ['Transcription'],
    }),
    
    deleteTranscription: builder.mutation({
      query: (id) => ({
        url: `/transcriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transcription'],
    }),
  }),
});

export const {
  useUploadAndTranscribeMutation,
  useGetTranscriptionsQuery,
  useDeleteTranscriptionMutation,
} = transcriptionApi;
