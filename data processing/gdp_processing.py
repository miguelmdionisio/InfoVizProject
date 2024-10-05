import pandas as pd

def replace_missing_values(input_file, output_file):
    try:
        df = pd.read_csv(input_file)
        df.fillna(-1, inplace=True)
        df.to_csv(output_file, index=False)
        print(f"Missing values replaced with -1 and saved to {output_file}")
    except FileNotFoundError:
        print(f"Error: The file {input_file} was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
if __name__ == "__main__":
    input_csv = "data/gdp_clean.csv"
    output_csv = "processed_data/gdp_clean.csv"
    replace_missing_values(input_csv, output_csv)
