import { supabase } from './supabase.js';

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.');
  return supabase;
}

function throwIfError(error) {
  if (error) throw new Error(error.message);
}

export async function fetchDocumentation() {
  const client = requireClient();
  const { data, error } = await client
    .from('documentation_sections')
    .select('id, name, short_name, color, position, topics(id, title, position, topic_content(subtitle, lead, content_blocks, sources, related_topics))')
    .order('position')
    .order('position', { foreignTable: 'topics' });
  throwIfError(error);

  return data.map((section) => ({
    id: section.id,
    name: section.name,
    short: section.short_name,
    color: section.color,
    topics: (section.topics ?? []).map((topic) => ({
      ...topic,
      doc: topic.topic_content ? {
        subtitle: topic.topic_content.subtitle,
        lead: topic.topic_content.lead,
        sections: topic.topic_content.content_blocks ?? [],
        sources: topic.topic_content.sources ?? [],
        related: topic.topic_content.related_topics ?? []
      } : null
    }))
  }));
}

export async function createTopic(sectionId, title, doc, position) {
  const client = requireClient();
  const { data: topic, error: topicError } = await client
    .from('topics')
    .insert({ section_id: sectionId, title, position })
    .select('id, title, position')
    .single();
  throwIfError(topicError);
  try {
    await saveContent(topic.id, doc);
  } catch (error) {
    // Avoid leaving an empty topic behind if its content could not be saved.
    await client.from('topics').delete().eq('id', topic.id);
    throw error;
  }
  return { ...topic, doc };
}

export async function updateTopic(topicId, title, doc) {
  const client = requireClient();
  const { error } = await client.from('topics').update({ title }).eq('id', topicId);
  throwIfError(error);
  await saveContent(topicId, doc);
}

async function saveContent(topicId, doc) {
  const client = requireClient();
  const { error } = await client.from('topic_content').upsert({
    topic_id: topicId,
    subtitle: doc.subtitle,
    lead: doc.lead,
    content_blocks: doc.sections,
    sources: doc.sources,
    related_topics: doc.related ?? []
  }, { onConflict: 'topic_id' });
  throwIfError(error);
}

export async function deleteTopic(topicId) {
  const { error } = await requireClient().from('topics').delete().eq('id', topicId);
  throwIfError(error);
}
