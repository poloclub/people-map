
# Numpy and Pandas
import pandas as pd
import numpy as np
import random 
starting_seed = random.seed(101)


# NLTK
import nltk
from nltk.tokenize import RegexpTokenizer
from nltk.stem.snowball import SnowballStemmer
from nltk.corpus import stopwords

#sklearn
from sklearn.cluster import KMeans 
from sklearn.mixture import GaussianMixture
from sklearn.decomposition import PCA
from sklearn.preprocessing import normalize
from sklearn.metrics import pairwise_distances
from sklearn.feature_extraction.text import TfidfVectorizer

# Other libraries
import re
import math
import pyarrow
import fastparquet




# Checks if input string is in English
def isEnglish(s):
    try:
        str(s).encode(encoding='utf-8').decode('ascii')
    except UnicodeDecodeError:
        return False
    else:
        return True

# Cleans and organizes the CSV for processing
def cleanCSV(df):

    
    # Remove rows with title that is blank, contains "error", or contains non-english characters
    cleanedDf = df
    cleanedDf = cleanedDf[cleanedDf['Title'] != "error"]
    cleanedDf = cleanedDf[cleanedDf['Title'] != ""]
    cleanedDf['isEnglishTitle'] = cleanedDf['Title'].map(lambda x: isEnglish(x))
    
    
    # Remove rows with abstract that is blank, contains "error", or contains non-english characters
    cleanedDf = cleanedDf[cleanedDf['Abstract'] != ""]
    cleanedDf = cleanedDf[cleanedDf['Abstract'] != "error"]
    cleanedDf['isEnglishAbstract'] = cleanedDf['Abstract'].map(lambda x: isEnglish(x))
    
    
    cleanedDf = cleanedDf[cleanedDf['isEnglishTitle'] & cleanedDf['Abstract']]
    
    # Remove rows with blank author or blank pictureURL
    cleanedDf['authorBlank'] = cleanedDf['Author'].map(lambda x: str(x) != "nan")
    cleanedDf['pictureURLBlank'] = cleanedDf['PictureURL'].map(lambda x: str(x) != "nan")
    
    # Only include rows that have both the author and the pictureURL
    cleanedDf = cleanedDf[cleanedDf['authorBlank'] & cleanedDf['pictureURLBlank']]

    # Re-index the CSV
    cleanedDf = cleanedDf.reset_index()
    
    return cleanedDf
    
    





# Normalize the textual data in the CSV for processing
def cleanData(df, addKeywords, amountOfKeywords):
    
    # Perform quick count of the number of unique keywords and count the most common keywords
    set_of_keywords= set()
    dictionary_of_keywords = {}
    past_keywords = 0
    for element in df.Keywords:
        if type(element) == str:
            if past_keywords != element:
                past_keywords = element
                for element2 in element.split("/"):
                    
                    lowercase_element = element2.lower()
                    lowercase_element = lowercase_element.replace(".","")
                    
                    if lowercase_element not in dictionary_of_keywords:
                        dictionary_of_keywords.update({lowercase_element : 1})
                    else:
                        dictionary_of_keywords[lowercase_element] += 1
    
    
    # Creates tuple of each keyword and their occurrence
    organized_keywords = []
    for element in sorted(dictionary_of_keywords.items(), 
                          key = lambda kv:(kv[1], kv[0])):
        organized_keywords.append((str(element[0]), str(element[1])))
        
    # Flips the order of the keywords, descending order
    final_list = []
    for i in range(1, len(organized_keywords) + 1):
        final_list.append(organized_keywords[len(organized_keywords) - i])
        

    
    # If addKeywords is true, add each of the keywords of the researcher amountOfKeywords times
    if addKeywords:
        df['paper_text_tokens'] = df.Title.map(lambda x: re.sub(r'\d+', '', x)) + ' ' + df.Abstract.map(lambda x: re.sub(r'\d+', '', x))
        
        for i in range(0, amountOfKeywords + 1):
            df['paper_text_tokens'] = df['paper_text_tokens'] + ' ' + df.Keywords.map(lambda x: re.sub(r'\d+', '', str(x)))
    else:
        df['paper_text_tokens'] = df.Title.map(lambda x: re.sub(r'\d+', '', x)) + ' ' + df.Abstract.map(lambda x: re.sub(r'\d+', '', x))

        
    # Remove / from key words
    df['paper_text_tokens'] = df.paper_text_tokens.map(lambda x: re.sub('/', ' ', x))
    
    # Lower case:
    df['paper_text_tokens'] = df.paper_text_tokens.map(lambda x: x.lower())

    

    # Remove HTML tags
    TAG_RE = re.compile(r'<[^>]+>')
    def remove_tags(text):
        return TAG_RE.sub('', text)
    df['paper_text_tokens'] = df.paper_text_tokens.map(lambda x: remove_tags(x))
    
    

    # Trim down abstracts that repeat themselves
    df['paper_text_tokens'] = df.paper_text_tokens.map(lambda x: x[0:1250])
    
    
    # Tokenize the titles
    df['paper_text_tokens'] = df.paper_text_tokens.map(lambda x: RegexpTokenizer(r'\w+').tokenize(x))
    
    
    
    # Stem the titles to simplify the processing
    snowball = SnowballStemmer("english")  
    df['paper_text_tokens'] = df.paper_text_tokens.map(lambda x: [snowball.stem(token) for token in x])
    
    
    
    # remove any and all stop words to simplify processing
    stop_en = stopwords.words('english')
    df['paper_text_tokens'] = df.paper_text_tokens.map(lambda x: [t for t in x if t not in stop_en]) 

    
    
    #Remove any extremely short words that could bias the processing
    df['paper_text_tokens'] = df.paper_text_tokens.map(lambda x: [t for t in x if len(t) > 2])
    
    
    
    # Re-combine all of the words together to form a clean title
    df['paper_text_tokens']= df['paper_text_tokens'].str.join(" ")
    
    
    # Concatenate all an author's titles and abstracts together, get research areas, and get names
    list_of_authors_works = []
    list_of_authors_research_areas = []
    list_of_authors_names = []
    list_of_authors_info = []
    i = 0

    while i < len(df['paper_text_tokens']):
        
        next_string = ''
        current_author = df.Author[i]
        count = 0
        list_of_authors_names.append(df.Author[i])
        
        picture_url = str(df.PictureURL[i])
        if picture_url == "nan":
            picture_url = "https://scholar.google.com/citations/images/avatar_scholar_256.png"
        
        next_info = {"Author": df.Author[i], "URL": df.URL[i],
                     "KeyWords": str(df.Keywords[i]).replace("/",", ").replace("nan",""), "PictureURL": picture_url,
                     "Citations": str(df.Citations[i]), "Affiliation": str(df.Affiliation[i]).replace("'", "").replace("/",",")}
        list_of_authors_info.append(next_info)
        

        while i + count < len(df['paper_text_tokens']) and current_author == df.Author[i + count]:
            next_string = next_string + ' ' + df['paper_text_tokens'][i + count]
            count = count + 1
        list_of_authors_works.append(next_string)
        if count == 0:
            i = i + 1
        else:
            i = i + count
    
        
    #Assign this list to pandas dataframe for analysis
    authors_works = pd.Series(list_of_authors_works)
    
    #Return the cleaned data set
    return authors_works, final_list, list_of_authors_research_areas, list_of_authors_names, list_of_authors_info






#Generates a TFIDF Matrix with the corresponding set of max features from the given dataset
def generateTFIDFMatrix(dataset, maxfeatures):
    tf_idf_vectorizor = TfidfVectorizer(stop_words = 'english', max_features = maxfeatures)
    tf_idf = tf_idf_vectorizor.fit_transform(dataset)
    tf_idf_norm = normalize(tf_idf)
    output_array = tf_idf_norm.toarray()
    return tf_idf, tf_idf_norm, output_array, tf_idf_vectorizor






# Perform Mixed Gaussian clustering on the inputted TFIDF array for the specified cluster number
def performMixedGaussian(input_array, clusterNumber, authors_names):
    
    sklearn_pca_GMM = PCA(n_components = 2, random_state = starting_seed)
    Y_sklearn_GMM = sklearn_pca_GMM.fit_transform(input_array)
    
    gmm = GaussianMixture(n_components=clusterNumber, covariance_type='full').fit(Y_sklearn_GMM)
    prediction_gmm = gmm.predict(Y_sklearn_GMM)
    
    return Y_sklearn_GMM, prediction_gmm





#Calculates the Euclidean distance between two points
def calculateDistance(point1, point2):
    return math.sqrt(((point1[0]-point2[0])**2)+((point1[1]-point2[1])**2))


# Generates the list and coordinate points for a JS File
def generateCoordinatesJS(dataset, information, colors):
    
    js_list = []
    
    for i in range(0, len(dataset)):

        next_connection = {"x0": dataset[i][0], "y0": dataset[i][1], "grouping1": colors[i][0], 
                           "grouping2": colors[i][1], "grouping3": colors[i][2], "grouping4": colors[i][3],
                           "grouping5": colors[i][4], "grouping6": colors[i][5]}
        next_connection.update(information[i])
        js_list.append(next_connection)
    
    return js_list





# Clean the topic vector so it can be vectorized
def createTopicVector(topic):

    # Lower case:
    topic = topic.lower()
    
    # Tokenize the titles
    topic = RegexpTokenizer(r'\w+').tokenize(topic)
    
    # Stem the titles to simplify the processing
    snowball = SnowballStemmer("english") 
    for i in range(0, len(topic)):
        topic[i] = snowball.stem(topic[i])
    
    # remove any and all stop words to simplify processing
    stop_en = stopwords.words('english')
    for i in range(0, len(topic)):
        if topic[i] in stop_en:
            topic.pop(i)
    
    
    #Remove any extremely short words that could bias the processing
    for i in range(0, len(topic)):
        if len(topic[i]) <= 2:
            topic.pop(i)

    topic = ' '.join(topic)
    
    
    #Return the cleaned data set
    return topic


# Vectorizes topic according to specificed TFIDF vectorizer
def vectorizeTopic(dataset, topic, maxfeatures):
    tf_idf_vectorizor = TfidfVectorizer(stop_words = 'english', max_features = maxfeatures)
    
    topic_series = pd.Series()
    topic_series = topic_series.append(pd.Series([topic]))

    dataset = pd.concat([dataset, topic_series])
    
    tf_idf = tf_idf_vectorizor.fit_transform(dataset)
    tf_idf_norm = normalize(tf_idf)
    output_array = tf_idf_norm.toarray()
    return tf_idf




# Generate similarity matrix from TFIDF matrix
def generateSimilarityMatrix(matrix):
    similarity_matrix = matrix.dot(matrix.transpose())
    return similarity_matrix




# Find the top n similar researchers to the last column (topic) of the similarity matrix
def topNSimilarResearchers(matrix, number):
    
    similar_column = matrix.getcol(matrix.shape[1] - 1).toarray()
    

    top_researchers = []
    for i in range(0, number):
        
        current_choice = 0
        while current_choice in top_researchers:
            current_choice += 1
        for j in range(0, len(similar_column)):
            if similar_column[j] > similar_column[current_choice]:
                if top_researchers.count(j) == 0 and j != matrix.shape[1] - 1:
                    current_choice = j
        

        top_researchers.append(current_choice)
    
    return top_researchers







# Generates a JS File with the coordinates for all the points in graphs with 0 to maxKeywordsEmphasis keywords emphasis included
def generateKeywordsClustersCoordinatesJS(df, dataName, maxNumberOfClusters, maxKeywordsEmphasis):

    js_list = []

    
    #  Find the initial author names
    clean_data, keywords, research_labels, authors_names, authors_info = cleanData(df, False, 0)
    
    # Create list with all the different colorings for the different numbers of clusters
    group_colorings = []
    for i in range(0, len(authors_names)):
        group_colorings.append([])
    
    # Generate TFIDF matrix of author's research
    tf_idf, tf_idf_norm, tf_idf_array, vectorizer = generateTFIDFMatrix(clean_data, 20000)


    # Calculate all the different clustering assignments between 1 and "maxNumberOfClusters" clusters
    for i in range(1, maxNumberOfClusters + 1):

        Y_sklearn_output, groups = performMixedGaussian(tf_idf_array, i, authors_names)
        
        for j in range(0, len(groups)):
            group_colorings[j].append(groups[j])

    # Generate coordinate positions for the initial set of points
    Y_sklearn_output, groups = performMixedGaussian(tf_idf_array, 5, authors_names)

    # Create initial list of the coordinates data
    js_list = generateCoordinatesJS(Y_sklearn_output, authors_info, group_colorings)

    # Keep charge of if the sign change had to be flipped due to the matrix factorization
    sign_change = False

    # Generate the coordinates for every keywords emphasis from 1 to 10 
    for i in range(1, maxKeywordsEmphasis + 1):

        print("Keywords Emphasis " + str(i))
        
        clean_data, keywords, research_labels, authors_names, authors_info = cleanData(df, True, i)

        tf_idf, tf_idf_norm, tf_idf_array, vectorizer = generateTFIDFMatrix(clean_data, 20000)

        Y_sklearn_output, groups = performMixedGaussian(tf_idf_array, 5, authors_names)



        # If max change in points is greater than 0.8, we know the points have 
        # flipped and need to adjust the sign

        net_changeX = 0.0
        net_changeY = 0.0
        min_y = 1000
        max_y = -1000
        for k in range(0, len(Y_sklearn_output)):

            previous_point = (js_list[k]["x" + str(i - 1)], js_list[k]["y" + str(i - 1)])

            if sign_change:
                current_point = (-1 * Y_sklearn_output[k][0], Y_sklearn_output[k][1])
            else:
                current_point = (Y_sklearn_output[k][0], Y_sklearn_output[k][1])

            if current_point[0] - previous_point[0] > net_changeX:
                net_changeX = current_point[0] - previous_point[0]
            if current_point[1] - previous_point[1] > net_changeY:
                net_changeY = current_point[1] - previous_point[1]

            if min_y > current_point[1]:
                min_y = current_point[1]
            if max_y < current_point[1]:
                max_y = current_point[1]

        # If the x-coordinates have changed beyond .8, we know that the points have flipped
        # across the y-axis due to matrix factorization
        if net_changeX >= 0.8:
            if sign_change:
                sign_change = False
            else:
                sign_change = True

        # If the y-coordinates have changed beyond .8, we know that the points have flipped
        # across the x-axis due to matrix factorization
        if net_changeY > .8:
            y_flip = True
        else:
            y_flip = False


        # Update the JS with next set of points associated with keyword number   
        for j in range(0, len(Y_sklearn_output)):
            updated_x = Y_sklearn_output[j][0]
            updated_y = Y_sklearn_output[j][1]
            if sign_change:
                updated_x = -1 * Y_sklearn_output[j][0]
            if y_flip:
                updated_y = max_y + min_y - updated_y


            js_list[j].update({"x" + str(i) : updated_x})
            js_list[j].update({"y" + str(i) : updated_y})
            
    # Create string of list to generate JS file
    string_js = str(js_list)
    string_js = "export default " + string_js.replace("'", '"')

    text_file = open(dataName + ".js", "w", encoding="utf-8")
    n = text_file.write(string_js)
    text_file.close()

    total_clusters = []
    for i in range(0, len(authors_names)):         
        total_clusters.append({})

    # Update the js list with all the different groupings of colors
    # for each keywords emphasis value
    for j in range(1, maxNumberOfClusters + 1):
        print("We are at " + str(j) + " clusters.")
        k = 1
        while k <= maxKeywordsEmphasis:
            print(str(k))
            try:
                clean_data, keywords, research_labels, authors_names, authors_info = cleanData(df, True, k)

                #
                tf_idf, tf_idf_norm, tf_idf_array, vectorizer = generateTFIDFMatrix(clean_data, 20000)

                # 
                Y_sklearn_output, groups = performMixedGaussian(tf_idf_array, j, authors_names)


                for i in range(0, len(group_colorings)):

                    total_clusters[i].update({"grouping" + str(j) + "," + str(k): groups[i]})
                k = k + 1
                    
            except:
                print("Error!")
                

    return js_list, total_clusters





# Creates a JS File that specifies the coloring of the vertices based on the queried term 
# (e.g. Shows the top 5 researchers that score highest for 'machine learning')
def generateQueriedCoordinatesJS(dataset, information, colors, ranking):
    
    js_list = []
    
    ranking_list = []
    
    for i in range(0, len(dataset)):
        currentRank = -1
        if i in ranking:
            currentRank = ranking.index(i)
        next_connection = {"x0": dataset[i][0], "y0": dataset[i][1], "group": colors[i], "rank": currentRank}
        next_connection.update(information[i])
        js_list.append(next_connection)
        ranking_list.append( {"rank": currentRank} )
    
    return ranking_list


# Generate a queried string JS for PeopleMap based on query string, dataset, 
# number of top choices, and number of Keywords

def generateRankingJS(query_string, number_of_top_picks, df, numberOfKeywords):

    if numberOfKeywords >= 1:
        clean_data, keywords, research_labels, authors_names, authors_info = cleanData(df, True, numberOfKeywords)
    else:
        clean_data, keywords, research_labels, authors_names, authors_info = cleanData(df, False, 0)
    
    
    # Generate TFIDF Matrix without the vector
    tf_idf, tf_idf_norm, tf_idf_array, vectorizer = generateTFIDFMatrix(clean_data, 20000)
    
    # Perform standard clustering and positioning of researchers
    Y_sklearn_output, groups = performMixedGaussian(tf_idf_array, 5, authors_names)
    
    # Create topic vector of the query term
    topic_clean = createTopicVector(query_string)

    # Create a new matrix with the topic vector included
    tf_idf_topic = vectorizeTopic(clean_data, topic_clean, 20000)

    # Generate a similarity matrix
    similarity_matrix = generateSimilarityMatrix(tf_idf_topic)
    
    # Find the n top researchers for the queried string
    top_researchers = topNSimilarResearchers(similarity_matrix, number_of_top_picks)
    
    # Creating final ranking list
    ranking_list = generateQueriedCoordinatesJS(Y_sklearn_output, authors_info, groups, top_researchers)
    
    return ranking_list
    

    
# Generate a complete set of all possible combinations of keywords and number of top choices
# for a given dataset and list of queried words
def generateResearchQueryJS(df, keywords, number_of_top_picks):
    
    final_list = []
    for keyword in keywords:
        print(keyword[0])
        currentKeyword = keyword[0]
        current_dictionary = {}
        emphasis = 3
        erroredOut = 0 
        while emphasis < 4:
            if erroredOut >= 10:
                currentKeyword = currentKeyword.split(" ")
                if len(currentKeyword) == 1:
                    emphasis = 6
                else:
                    currentKeyword = currentKeyword[0]
                    erroredOut = 0
            else:
                try:
                    current_ranking = generateRankingJS(currentKeyword, number_of_top_picks, df, emphasis)
                    current_dictionary[emphasis] = current_ranking
                    emphasis = emphasis + 1
                    erroredOut = 0
                except:
                    print("Error caught!")
                    print("Emphasis" + str(emphasis))
                    print(currentKeyword)
                    erroredOut += 1
        if erroredOut < 10:
            final_list.append({keyword : current_dictionary})

    return final_list






# Recolor the clusters in the coordinates file to prevent rapid jumps between
# different colors as clusters change between keywords emphasis values
def changeRecoloring(total_clusters, maxNumberOfClusters, maxNumberOfKeywords):
    for j in range(2, maxNumberOfClusters + 1):

        print("We are at " + str(j) + " clusters for recoloring.")

        previous_clusters = []
        for i in range(0, j):
            previous_clusters.append([])

        k = 1
        while k <= maxNumberOfKeywords:

            if k == 1:

                for i in range(0, len(total_clusters)):
                    previous_clusters[total_clusters[i]["grouping" + str(j) + "," + str(k)]].append(i)
                k += 1

            elif k <= maxNumberOfKeywords:
                print("Clustering for Keywords " + str(k))
                current_clusters = []
                for i in range(0, j):
                    current_clusters.append([])
                for i in range(0, len(total_clusters)):
                    current_clusters[total_clusters[i]["grouping" + str(j) + "," + str(k)]].append(i)


                for x in range(0, j):
                    
                    for y in range(0, j):
                        overlap = list(set(current_clusters[x]) & set(previous_clusters[y]))

                        if x != y and len(overlap) >= len(current_clusters[x]) / 2:

                            holder_list = current_clusters[x]
                            current_clusters[x] = current_clusters[y]
                            current_clusters[y] = holder_list

                for x in range(0, len(total_clusters)):
                    for y in range(0, j):
                        if x in current_clusters[y]:
                            next_string = "grouping" + str(j) + "," + str(k)
                            total_clusters[x][next_string] = y

                previous_clusters = current_clusters
                k += 1  

    return total_clusters                      





# Generate all the PeopleMap processed data files based on
# a CSV, max cluster number, and max keyword number

def generatePeopleMapFiles(givenCSV, specifiedName, maxClusters, maxKeywordsEmphasis):
    
    # Load the CSV file
    #df = pd.read_csv(givenCSV)
    df = pd.read_parquet(givenCSV)
    df = cleanCSV(df)
    print("Completed cleaning CSV")


    # Generate coordinates JS file
    js_list, total_clusters = generateKeywordsClustersCoordinatesJS(df, str(specifiedName) + "Coordinates", maxClusters, maxKeywordsEmphasis)
    print("Complete generating Keywords JS and Clusters JS")


    # Recolor the clusters and create a clusters JS file
    total_clusters = changeRecoloring(total_clusters, maxClusters, maxKeywordsEmphasis)
    print("Completed recoloring of clusters")

    string_js = str(total_clusters)
    string_js = "export default " + string_js.replace("'", '"')
    text_file = open(str(specifiedName) + "Clusters.js", "w")
    n = text_file.write(string_js)
    text_file.close()


    # Create research query JS file
    clean_data, keywords, research_labels, authors_names, authors_info = cleanData(df, False, 0) 
    research_query_dictionary = generateResearchQueryJS(df, keywords, maxKeywordsEmphasis)

    # Organize Research Query data into dictionary to be exported
    final_dict = {}
    for key in research_query_dictionary:
        current_key = list(key.keys())[0]
        final_dict.update({(list(key.keys())[0][0]) : list(key.values())[0]})

    string_js = str(final_dict)
    string_js = "export default " + string_js.replace("'", '"')

    text_file = open(str(specifiedName) + "ResearchQuery.js", "w", encoding="utf-8")
    n = text_file.write(string_js)
    text_file.close()
    





###########################################################################

### SPECIFY YOUR HYPERPARAMETERS HERE ###

maxClusters = 6
maxKeywordsEmphasis = 5

specifiedCitedName = "cited"
mostCitedCSV = "citedScholarDataset.gzip"

specifiedRecentName = "recent"
mostRecentCSV = "recentScholarDataset.gzip"

print("Started")

generatePeopleMapFiles(mostCitedCSV, specifiedCitedName, maxClusters, maxKeywordsEmphasis)
print("Completed Generating Files for Most Cited Dataset")

#generatePeopleMapFiles(mostRecentCSV, specifiedRecentName, maxClusters, maxKeywordsEmphasis)
#print("Completed Generating Files for Most Recent Dataset")

print("Completed Generating all the Files!")

###########################################################################







