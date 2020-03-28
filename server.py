from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import random 
starting_seed = random.seed(101)


# NLTK
import nltk
from nltk.tokenize import RegexpTokenizer
from nltk.stem.snowball import SnowballStemmer
from nltk.corpus import stopwords
import re
nltk.download('stopwords')

from sklearn.cluster import KMeans 
from sklearn.mixture import GaussianMixture
from scipy.spatial.distance import cdist
from sklearn.decomposition import PCA
from sklearn.preprocessing import normalize
from sklearn.metrics import pairwise_distances
from scipy.stats import multivariate_normal as mvn



def cleanData(df, addKeywords, amountOfKeywords):
    
    # Perform quick count of the number of unique keywords
    set_of_keywords= set()
    for element in df.Keywords:
        if type(element) == str:
            for element2 in element.split("/"):
                set_of_keywords.add(element2)
    
    #Remove all the numerals and turn everything into lowercase

    # Only uses titles right now
    # Removing numerals:
    
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
        list_of_authors_research_areas.append(df.ResearchArea[i])
        list_of_authors_names.append(df.Author[i])
        
        
        next_info = {"Author": df.Author[i], "ResearchArea": df.ResearchArea[i].replace("_"," "), "URL": df.URL[i],
                     "KeyWords": str(df.Keywords[i]).replace("/",", ").replace("nan",""), 
                     "Citations": df.Citations[i], "Affiliation": df.Affiliation[i].replace("'", "").replace("/",",")}
        list_of_authors_info.append(next_info)
        
        while i + count < len(df['paper_text_tokens']) and current_author == df.Author[i + count]:
            next_string = next_string + ' ' + df['paper_text_tokens'][i + count]
            count = count + 1
        list_of_authors_works.append(next_string)
        i = i + count
    
        
    #Assign this list to pandas dataframe for analysis
    authors_works = pd.Series(list_of_authors_works)
    
    
    #Return the cleaned data set
    return authors_works, list_of_authors_research_areas, list_of_authors_names, list_of_authors_info





class GMM:
    """ Gaussian Mixture Model
    
    Parameters
    -----------
        k: int , number of gaussian distributions
        
        seed: int, will be randomly set if None
        
        max_iter: int, number of iterations to run algorithm, default: 200
        
    Attributes
    -----------
       centroids: array, k, number_features
       
       cluster_labels: label for each data point
       
    """
    def __init__(self, C, n_runs):
        self.C = C # number of Guassians/clusters
        self.n_runs = n_runs
        self.seed = starting_seed
        
    
    def get_params(self):
        return (self.mu, self.pi, self.sigma)
    
    
        
    def calculate_mean_covariance(self, X, prediction):
        """Calculate means and covariance of different
            clusters from k-means prediction
        
        Parameters:
        ------------
        prediction: cluster labels from k-means
        
        X: N*d numpy array data points 
        
        Returns:
        -------------
        intial_means: for E-step of EM algorithm
        
        intial_cov: for E-step of EM algorithm
        
        """
        d = X.shape[1]
        labels = np.unique(prediction)
        self.initial_means = np.zeros((self.C, d))
        self.initial_cov = np.zeros((self.C, d, d))
        self.initial_pi = np.zeros(self.C)
        
        counter=0
        for label in labels:
            ids = np.where(prediction == label) # returns indices
            self.initial_pi[counter] = len(ids[0]) / X.shape[0]
            self.initial_means[counter,:] = np.mean(X[ids], axis = 0)
            de_meaned = X[ids] - self.initial_means[counter,:]
            Nk = X[ids].shape[0] # number of data points in current gaussian
            self.initial_cov[counter,:, :] = np.dot(self.initial_pi[counter] * de_meaned.T, de_meaned) / Nk
            counter+=1
        assert np.sum(self.initial_pi) == 1    
            
        return (self.initial_means, self.initial_cov, self.initial_pi)
    
    
    
    def _initialise_parameters(self, X):
        """Implement k-means to find starting
            parameter values.
            https://datascience.stackexchange.com/questions/11487/how-do-i-obtain-the-weight-and-variance-of-a-k-means-cluster
        Parameters:
        ------------
        X: numpy array of data points
        
        Returns:
        ----------
        tuple containing initial means and covariance
        
        _initial_means: numpy array: (C*d)
        
        _initial_cov: numpy array: (C,d*d)
        
        
        """
        n_clusters = self.C
        kmeans = KMeans(n_clusters= n_clusters, init="k-means++", max_iter=500, algorithm = 'auto')
        fitted = kmeans.fit(X)
        prediction = kmeans.predict(X)
        self._initial_means, self._initial_cov, self._initial_pi = self.calculate_mean_covariance(X, prediction)
        
        
        return (self._initial_means, self._initial_cov, self._initial_pi)
            
        
        
    def _e_step(self, X, pi, mu, sigma):
        """Performs E-step on GMM model
        Parameters:
        ------------
        X: (N x d), data points, m: no of features
        pi: (C), weights of mixture components
        mu: (C x d), mixture component means
        sigma: (C x d x d), mixture component covariance matrices
        Returns:
        ----------
        gamma: (N x C), probabilities of clusters for objects
        """
        N = X.shape[0] 
        self.gamma = np.zeros((N, self.C))

        const_c = np.zeros(self.C)
        
        
        self.mu = self.mu if self._initial_means is None else self._initial_means
        self.pi = self.pi if self._initial_pi is None else self._initial_pi
        self.sigma = self.sigma if self._initial_cov is None else self._initial_cov

        for c in range(self.C):
            # Posterior Distribution using Bayes Rule
            self.gamma[:,c] = self.pi[c] * mvn.pdf(X, self.mu[c,:], self.sigma[c])

        # normalize across columns to make a valid probability
        gamma_norm = np.sum(self.gamma, axis=1)[:,np.newaxis]
        self.gamma /= gamma_norm

        return self.gamma
    
    
    def _m_step(self, X, gamma):
        """Performs M-step of the GMM
        We need to update our priors, our means
        and our covariance matrix.
        Parameters:
        -----------
        X: (N x d), data 
        gamma: (N x C), posterior distribution of lower bound 
        Returns:
        ---------
        pi: (C)
        mu: (C x d)
        sigma: (C x d x d)
        """
        N = X.shape[0] # number of objects
        C = self.gamma.shape[1] # number of clusters
        d = X.shape[1] # dimension of each object

        # responsibilities for each gaussian
        self.pi = np.mean(self.gamma, axis = 0)

        self.mu = np.dot(self.gamma.T, X) / np.sum(self.gamma, axis = 0)[:,np.newaxis]

        for c in range(C):
            x = X - self.mu[c, :] # (N x d)
            
            gamma_diag = np.diag(self.gamma[:,c])
            x_mu = np.matrix(x)
            gamma_diag = np.matrix(gamma_diag)

            sigma_c = x.T * gamma_diag * x
            self.sigma[c,:,:]=(sigma_c) / np.sum(self.gamma, axis = 0)[:,np.newaxis][c]

        return self.pi, self.mu, self.sigma
    
    
    def _compute_loss_function(self, X, pi, mu, sigma):
        """Computes lower bound loss function
        
        Parameters:
        -----------
        X: (N x d), data 
        
        Returns:
        ---------
        pi: (C)
        mu: (C x d)
        sigma: (C x d x d)
        """
        N = X.shape[0]
        C = self.gamma.shape[1]
        self.loss = np.zeros((N, C))

        for c in range(C):
            dist = mvn(self.mu[c], self.sigma[c],allow_singular=True)
            self.loss[:,c] = self.gamma[:,c] * (np.log(self.pi[c]+0.00001)+dist.logpdf(X)-np.log(self.gamma[:,c]+0.000001))
        self.loss = np.sum(self.loss)
        return self.loss
    
    
    
    def fit(self, X):
        """Compute the E-step and M-step and
            Calculates the lowerbound
        
        Parameters:
        -----------
        X: (N x d), data 
        
        Returns:
        ----------
        instance of GMM
        
        """
        
        d = X.shape[1]
        self.mu, self.sigma, self.pi =  self._initialise_parameters(X)
        
        try:
            for run in range(self.n_runs):  
                self.gamma  = self._e_step(X, self.mu, self.pi, self.sigma)
                self.pi, self.mu, self.sigma = self._m_step(X, self.gamma)
                loss = self._compute_loss_function(X, self.pi, self.mu, self.sigma)
                
                if run % 10 == 0:
                    print("Iteration: %d Loss: %0.6f" %(run, loss))

        
        except Exception as e:
            print(e)
            
        
        return self
    
    
    
    
    def predict(self, X):
        """Returns predicted labels using Bayes Rule to
        Calculate the posterior distribution
        
        Parameters:
        -------------
        X: ?*d numpy array
        
        Returns:
        ----------
        labels: predicted cluster based on 
        highest responsibility gamma.
        
        """
        labels = np.zeros((X.shape[0], self.C))
        
        for c in range(self.C):
            labels [:,c] = self.pi[c] * mvn.pdf(X, self.mu[c,:], self.sigma[c])
        labels  = labels .argmax(1)
        return labels 
    
    def predict_proba(self, X):
        """Returns predicted labels
        
        Parameters:
        -------------
        X: N*d numpy array
        
        Returns:
        ----------
        labels: predicted cluster based on 
        highest responsibility gamma.
        
        """
        post_proba = np.zeros((X.shape[0], self.C))
        
        for c in range(self.C):
            # Posterior Distribution using Bayes Rule, try and vectorise
            post_proba[:,c] = self.pi[c] * mvn.pdf(X, self.mu[c,:], self.sigma[c])
    
        return post_proba






#Generates a TFIDF Matrix with the corresponding set of max features from the given dataset
def generateTFIDFMatrix(dataset, maxfeatures):
    tf_idf_vectorizor = TfidfVectorizer(stop_words = 'english', max_features = maxfeatures)
    tf_idf = tf_idf_vectorizor.fit_transform(dataset)
    tf_idf_norm = normalize(tf_idf)
    output_array = tf_idf_norm.toarray()
    return tf_idf, tf_idf_norm, output_array, tf_idf_vectorizor






# Perform Mixed Gaussian clustering on the inputted TFIDF array for the specified cluster number

def performMixedGaussian(input_array, clusterNumber, withEllipses, withAnnotations, authors_names):
    
    
    sklearn_pca_GMM = PCA(n_components = 2, random_state = starting_seed)
    Y_sklearn_GMM = sklearn_pca_GMM.fit_transform(input_array)
    
    
    #Other persons implementation
    model = GMM(clusterNumber, n_runs = 40)
    fitted_values = model.fit(Y_sklearn_GMM)
    predicted_values = model.predict(Y_sklearn_GMM)

    # # compute centers as point of highest density of distribution
    centers_other = np.zeros((clusterNumber,2))
    for i in range(model.C):
        density_other = mvn(cov=model.sigma[i], mean=model.mu[i]).logpdf(Y_sklearn_GMM)
        centers_other[i, :] = Y_sklearn_GMM[np.argmax(density_other)]
    

    gmm = GaussianMixture(n_components=clusterNumber, covariance_type='full').fit(Y_sklearn_GMM)
    prediction_gmm = gmm.predict(Y_sklearn_GMM)
    probs = gmm.predict_proba(Y_sklearn_GMM)

    
    centers = np.zeros((clusterNumber,2))
    for i in range(clusterNumber):
        density = mvn(cov=gmm.covariances_[i], mean=gmm.means_[i]).logpdf(Y_sklearn_GMM)
        centers[i, :] = Y_sklearn_GMM[np.argmax(density)]
    
            
    return Y_sklearn_GMM, prediction_gmm




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
    topic_series.set_value(0, topic)
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
             


# Creates a JSON File that specifies the coloring of the vertices based on the queried term 
# (e.g. Shows the top 5 researchers that score highest for 'machine learning')
def generateQueriedCoordinatesJSON(dataset, information, colors, ranking):
    
    json_list = []
    
    ranking_list = []
    
    for i in range(0, len(dataset)):
        currentRank = -1
        if i in ranking:
            currentRank = ranking.index(i)
        next_connection = {"x0": dataset[i][0], "y0": dataset[i][1], "group": colors[i], "rank": currentRank}
        next_connection.update(information[i])
        json_list.append(next_connection)
        ranking_list.append( {"rank": currentRank} )
    
    return ranking_list


# Generate a queried string JSON for PeopleMap based on query string, dataset, 
# number of top choices, and number of Keywords

def generateRankingJSON(query_string, number_of_top_picks, jsonName, df, numberOfKeywords):

    if numberOfKeywords >= 1:
        clean_data, research_labels, authors_names, authors_info = cleanData(df, True, numberOfKeywords)
    else:
        clean_data, research_labels, authors_names, authors_info = cleanData(df, False, 0)
    
    # Generate TFIDF Matrix without the vector
    tf_idf, tf_idf_norm, tf_idf_array, vectorizer = generateTFIDFMatrix(clean_data, 20000)
    
    # Perform standard clustering and positioning of researchers
    Y_sklearn_output, groups = performMixedGaussian(tf_idf_array, 5, False, True, authors_names)
    
    # Create topic vector of the query term
    topic_clean = createTopicVector(query_string)

    # Create a new matrix with the topic vector included
    tf_idf_topic = vectorizeTopic(clean_data, topic_clean, 20000)

    # Generate a similarity matrix
    similarity_matrix = generateSimilarityMatrix(tf_idf_topic)
    
    # Find the n top researchers for the queried string
    top_researchers = topNSimilarResearchers(similarity_matrix, number_of_top_picks)
    
    # Creating final ranking list
    ranking_list = generateQueriedCoordinatesJSON(Y_sklearn_output, authors_info, groups, top_researchers)
    
    return ranking_list

df = pd.read_csv("ML_clean.csv")

app = Flask(__name__)
CORS(app)

@app.route("/", methods=['POST'])
def update_map():
    # Put inputted string query here
    inputtedString = request.json["inputString"]# "Machine Learning"

    # Put number of top keywords here
    numberOfTopKeywords = request.json["numKeywords"]

    # Put number of top choices here
    numberOfTopChoices = request.json["numChoices"]

    return jsonify(generateRankingJSON(inputtedString, numberOfTopChoices, "rankingData", df, numberOfTopKeywords))

if __name__ == "__main__":
    app.run(host='0.0.0.0', port='8000')
