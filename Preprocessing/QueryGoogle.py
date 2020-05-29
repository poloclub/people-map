
import scholarly
import numpy
import re

regex = re.compile('[^a-zA-Z]')


# Method for cleaning the abstract text of html tags
def clean_abstract(ab):
    for i in range (0, 8):
        if ab.find("<div") > -1 and ab.find(">") > -1:
            start = ab.find("<div")
            end = ab.find(">")
            ab = ab[0: start] + ab[(end + 1):]
        elif ab.find("</div") > -1 and ab.find(">") > -1:
            start = ab.find("</div")
            end = ab.find(">")
            ab = ab[0: start] + ab[(end + 1):]
    return ab

# Scrapes the top 50 most cited publications from the 
# input list of researchers and outputs a csv with the info
def generateCitedGoogleScholarCSV(list_of_researchers):
    grid = []

    titles_array = ['Author','URL','Title','Abstract','Keywords','Citations','Affiliation','Year', 'PictureURL']
    grid.append(titles_array)

    for researcher in list_of_researchers:
    	print(researcher)
    	search_query = 'error'
    	author = 'error'
    	publications = []
    	try:
    		search_query = scholarly.search_author(researcher)
    		author = next(search_query).fill()
    		publications = author.publications
    	except:
    		search_query = 'error'
    		author = 'error'

    	# Gather the author, URL, title, abstract, keywords, citations, affiliation, publication year,
    	# and picture URL from each researcher's publication
    	for i in range(0, 50):
	        print(i)
	        name = researcher
	        url = ''
	        try:
	        	url = str(author.url_picture).replace("view_op=medium_photo&","")
	        except:
	        	url = 'error'
	        pictureURL = ''
	        try:
	        	pictureURL = str(author.url_picture)
	        except:
	        	pictureURL = 'error'
	        title = ''
	        try:
	        	title = str(author.publications[i].fill().bib['title'])
	        	title = regex.sub(' ', title)
	        except:
	        	title = 'error'
	        title = title.replace(',', ' ')
	        abstract = ''
	        try:
	        	abstract = clean_abstract(str(author.publications[i].fill().bib['abstract']))
	        	abstract = regex.sub(' ', abstract)
	        except:
	        	abstract = 'error'
	        abstract = abstract.replace(',', ' ')
	        interests = ''
	        try:
	        	for i in range(0, len(author.interests)):
	        		if len(interests) == 0:
	        			interests = str(author.interests[i])
	        			interests = regex.sub(' ', interests)
	        		else:
	        			nextInterest = str(author.interests[i])
	        			nextInterest = regex.sub(' ', nextInterest)
	        			interests = interests + '/' + nextInterest
	        except:
	        	interests = 'error'
	        interests = interests.replace(',',' ')

	        citations = ''
	        try:
	        	citations = str(author.citedby)
	        except:
	        	citations = 'error'
	        citations = citations.replace(',',' ')

	        affiliation = ''
	        try:
	        	affiliation = str(author.affiliation)
	        	affiliation = affiliation.replace(',','XYZ')
	        	affiliation = regex.sub(' ', affiliation)
	        	affiliation = affiliation.replace('XYZ',',')
	        except:
	        	affiliation = 'error'

	        # Default set the year to -1 since the information 
	        # isn't relevant for analysis of this publication set
	        year = -1

	        affiliation = affiliation.replace(',','/')

	        
	        test_array = [str(name), url, str(title), str(abstract), str(interests), citations, str(affiliation), year, pictureURL]
	        grid.append(test_array)

    return grid





# Scrapes the top 50 most cited publications from the 
# input list of researchers and outputs a csv with the info
def generateRecentGoogleScholarCSV(list_of_researchers):

	grid = []

	titles_array = ['Author','URL','Title','Abstract','Keywords','Citations','Affiliation','Year','PictureURL']
	grid.append(titles_array)

	# Gather the author, URL, title, abstract, keywords, citations, affiliation, publication year,
    # and picture URL from each researcher's publication
	for researcher in list_of_researchers:
		print(researcher)
		search_query = 'error'
		author = 'error'
		publications = []
		try:
			search_query = scholarly.search_author(researcher)
			author = next(search_query).fill()
			publications = author.publications
		except:
			search_query = 'error'
			author = 'error'

		# Find the min year and the max year of publication
		max_year = 0
		min_year = 3000
		for publication in publications:
			try:

				if publication.bib['year'] > max_year:
					max_year = publication.bib['year']
				if publication.bib['year'] < min_year:
					min_year = publication.bib['year']
			except:
				max_year = max_year

		# Only go to 50 publications
		counter = 50

		# Go through the publications in descending order of publication
		for i in range(0, max_year - min_year + 1):
			if counter == 0:
				i = max_year - min_year + 1
			else:

				# Look through publications for all publications in that year
				print("Year " + str(max_year - i))
				for publication in publications:
					try:
						if publication.bib['year'] == max_year - i and counter > 0:

							counter = counter - 1
							print(counter)

							name = researcher
							url = ''

							try:
								url = str(author.url_picture).replace("view_op=medium_photo&","")
							except:
								url = 'error'

							pictureURL = ''
							try:
								pictureURL = str(author.url_picture)
							except:
								pictureURL = 'error'

							title = ''
							try:
								title = str(publication.fill().bib['title'])
								title = regex.sub(' ', title)
							except:
								title = 'error'
							title = title.replace(',', ' ')
							abstract = ''
							try:
								abstract = clean_abstract(str(publication.fill().bib['abstract']))
								abstract = regex.sub(' ', abstract)
							except:
								abstract = 'error'
							abstract = abstract.replace(',', ' ')
							interests = ''
							try:
								for j in range(0, len(author.interests)):
									if len(interests) == 0:
					        			interests = str(author.interests[j])
					        			interests = regex.sub(' ', interests)
					        		else:
					        			nextInterest = str(author.interests[j])
					        			nextInterest = regex.sub(' ', nextInterest)
					        			interests = interests + '/' + nextInterest
							except:
								interests = 'error'
							interests = interests.replace(',',' ')


							citations = ''
							try:
								citations = str(author.citedby)
							except:
								citations = 'error'
							citations = citations.replace(',',' ')

							affiliation = ''
							try:
								affiliation = str(author.affiliation)
					        	affiliation = affiliation.replace(',','XYZ')
					        	affiliation = regex.sub(' ', affiliation)
					        	affiliation = affiliation.replace('XYZ',',')

							except:
								affiliation = 'error'
							affiliation = affiliation.replace(',','/')

							year = 0
							try:
								year = publication.bib['year']
							except:
								year = -1

							test_array = [str(name), url, str(title), str(abstract), str(interests), citations, str(affiliation), year, pictureURL]
							grid.append(test_array)
					except:
						test_array = []
	return grid



#######################################################################################

# TYPE YOUR LIST HERE
# example_list = ['Isaac Newton', 'Albert Einstein', 'Galileo']
scrape_list = []



cited = generateCitedGoogleScholarCSV(scrape_list)

print("Completed Cited Publication Scraping!")
citedArray = numpy.array(cited)
numpy.savetxt('citedScholarDataset.csv', citedArray, delimiter=',', fmt='%s')


recent = generateRecentGoogleScholarCSV(scrape_list)

print("Completed Recent Publication Scraping!")
recentArray = numpy.array(recent)
numpy.savetxt('recentScholarDataset.csv', recentArray, delimiter=',', fmt='%s')


#########################################################################################




