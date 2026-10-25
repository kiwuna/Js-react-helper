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

export async function fetchEditorPermission() {
  const { data, error } = await requireClient().rpc('current_user_is_editor');
  throwIfError(error);
  return Boolean(data);
}

export async function createTopic(sectionId, title, doc, position) {
  const client = requireClient();
  const topic = await saveTopic(client, null, sectionId, title, position, doc);
  return { ...topic, doc };
}

export async function updateTopic(topicId, title, doc) {
  const client = requireClient();
  await saveTopic(client, topicId, null, title, null, doc);
}

async function saveTopic(client, topicId, sectionId, title, position, doc) {
  const { data, error } = await client.rpc('save_documentation_topic', {
    p_topic_id: topicId,
    p_section_id: sectionId,
    p_title: title,
    p_position: position,
    p_subtitle: doc.subtitle,
    p_lead: doc.lead,
    p_content_blocks: doc.sections,
    p_sources: doc.sources,
    p_related_topics: doc.related ?? []
  }).single();
  throwIfError(error);
  return data;
}

export async function deleteTopic(topicId) {
  const { error } = await requireClient().from('topics').delete().eq('id', topicId);
  throwIfError(error);
}
