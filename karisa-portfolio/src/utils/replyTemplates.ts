export const QUICK_REPLY_TEMPLATES = {
  acknowledgement: [
    {
      id: 'thank_you',
      title: 'Thank you',
      content: 'Thank you for reaching out, {name}! I appreciate your interest in {subject}. I will review your message and get back to you shortly.'
    },
    {
      id: 'received',
      title: 'Message received',
      content: 'Hi {name},\n\nI have received your message and will respond within 24-48 hours.\n\nBest regards'
    }
  ],
  information: [
    {
      id: 'need_more_info',
      title: 'Need more information',
      content: 'Thank you for your inquiry, {name}. To better assist you, could you please provide more details about {subject}?'
    },
    {
      id: 'clarify_details',
      title: 'Request clarification',
      content: 'Hi {name},\n\nThank you for reaching out. I have a few questions to better understand your needs regarding {subject}. Could you elaborate on...'
    }
  ],
  collaboration: [
    {
      id: 'interested',
      title: 'Very interested',
      content: 'Hi {name},\n\nThank you for reaching out about {subject}. I am very interested in exploring this opportunity further. Let\'s discuss more details.'
    },
    {
      id: 'lets_connect',
      title: 'Let\'s connect',
      content: 'Hi {name},\n\nI\'m excited about your proposal for {subject}! I\'d love to learn more. Are you available for a call this week?'
    }
  ],
  scheduling: [
    {
      id: 'schedule_call',
      title: 'Schedule a call',
      content: 'Hi {name},\n\nThanks for your interest! I\'d like to discuss {subject} in more detail. I have availability on [DAYS]. Would any of these times work for you?'
    }
  ],
  followup: [
    {
      id: 'checking_in',
      title: 'Checking in',
      content: 'Hi {name},\n\nI wanted to follow up on your message about {subject}. Have you had a chance to consider the opportunity? I\'m still very interested!'
    }
  ]
};

export const interpolateTemplate = (template: string, variables: Record<string, string>): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  return result;
};

export const getAllTemplatesByCategory = (): Record<string, any[]> => {
  return QUICK_REPLY_TEMPLATES;
};

export const getTemplateById = (id: string): any => {
  for (const templates of Object.values(QUICK_REPLY_TEMPLATES)) {
    const template = templates.find(t => t.id === id);
    if (template) return template;
  }
  return null;
};
