# prepare_data.py
import pandas as pd
from datasets import load_dataset
from sentence_transformers import SentenceTransformer
import umap
import os

print("Step 1: Loading dataset...")
dataset = load_dataset("shareai/ShareLM", split='train')
df = dataset.to_pandas()

def process_conversation(row):
    conversation_text = ""
    user_prompts = []
    num_turns = 0
    for turn_pair in row['conversation']:
        if 'human' in turn_pair and turn_pair['human']:
            human_prompt = turn_pair['human']
            conversation_text += f"HUMAN: {human_prompt}\n\n"
            user_prompts.append(human_prompt)
            num_turns += 1
        if 'assistant' in turn_pair and turn_pair['assistant']:
            assistant_response = turn_pair['assistant']
            conversation_text += f"ASSISTANT: {assistant_response}\n\n"
    return {
        'conversation_id': row['conversation_id'],
        'full_text': conversation_text,
        'first_prompt': user_prompts[0] if user_prompts else "",
    }

print("Step 2: Processing conversations...")
processed_df = df.apply(process_conversation, axis=1, result_type='expand')

print("Step 3: Generating embeddings...")
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(processed_df['first_prompt'].tolist(), show_progress_bar=True)

print("Step 4: Reducing dimensionality with UMAP...")
reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, random_state=42)
embedding_2d = reducer.fit_transform(embeddings)
coords_df = pd.DataFrame(embedding_2d, columns=['x', 'y'])

# Combine processed text with coordinates
final_df = pd.concat([processed_df, coords_df], axis=1)

print("Step 5: Saving data files...")
output_dir = 'public'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# We only need one file for the app, which contains all necessary info.
final_df[['conversation_id', 'full_text', 'x', 'y']].to_csv(os.path.join(output_dir, 'sharelm_data.csv'), index=False)

print("✅ Data preparation complete. The file 'public/sharelm_data.csv' is ready.")
