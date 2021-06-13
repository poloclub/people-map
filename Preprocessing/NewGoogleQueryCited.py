from scholarly import scholarly
import numpy
import re
import pandas as pd
import pyarrow
import fastparquet

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
def newGenerateCitedGoogleScholarCSV(list_of_researchers):
    grid = []

    #titles_array = ['Author','URL','Title','Abstract','Keywords','Citations','Affiliation','Year', 'PictureURL']
    #grid.append(titles_array)

    outputGrid = []
    output_columns = ['Name', 'URL', 'SuccessfullyScraped']

    for i in range(0, len(list_of_researchers)):

    	#researcher = list_of_researchers.iloc[i][0]
    	researcher = ""
    	researcher_URL = list_of_researchers.iloc[i][1]

    	researcherID = researcher_URL.replace("https://scholar.google.com/citations?user=", "")
    	researcherID = researcherID.replace("&hl=en&oi=ao", "")

    	#print(researcher)
    	search_query = ''
    	author = ''
    	publications = []

    	try:
    		search_query = scholarly.search_author_id(researcherID)
    		author = search_query.fill()
			


    		researcher = author.name

    		print(researcher)
			


    		if author != None:

    			publications = author.publications

    			outputGrid.append([researcher, str(researcher_URL), "True"])

    		else:
    			search_query = 'error'
	    		author = 'error'

	    		outputGrid.append([researcher, str(researcher_URL), "False"])

    	except:

    		try:

    			search_query = next(scholarly.search_author(list_of_researchers.iloc[i][0]))
	    		author = search_query.fill()
				


	    		researcher = author.name

	    		print(researcher)
				


	    		if author != None:

	    			publications = author.publications

	    			outputGrid.append([researcher, str(researcher_URL), "True"])

	    		else:
	    			search_query = 'error'
		    		author = 'error'

		    		outputGrid.append([researcher, str(researcher_URL), "False"])

    		except:

	    		search_query = 'error'
	    		author = 'error'

	    		outputGrid.append([researcher, str(researcher_URL), "False"])


    	if search_query != 'error':

	    	# Gather the author, URL, title, abstract, keywords, citations, affiliation, publication year,
	    	# and picture URL from each researcher's publication
	    	for i in range(0, 50):
		        print(i)
		        name = researcher
		        url = ''
		        try:
		        	url = researcher_URL
		        except:
		        	url = 'error'
		        pictureURL = ''
		        try:
		        	pictureURL = "https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=" + researcherID
		        except:
		        	pictureURL = 'error'
		        title = ''
		        try:
		        	title = str(author.publications[i].fill().bib['title'])
		        	#title = '"' + title + '"'
		        	title = title.replace(",", "")
		        	#title = regex.sub(' ', title)
		        except:
		        	title = 'error'
		        #title = title.replace(',', ' ')
		        abstract = ''
		        try:
		        	#abstract = clean_abstract(str(author.publications[i].fill().bib['abstract']))
		        	abstract = str(author.publications[i].fill().bib['abstract'])
		        	#abstract = '"' + abstract + '"'
		        	abstract = abstract.replace(",", "")
		        	#abstract = regex.sub(' ', abstract)
		        except:
		        	abstract = 'error'
		        #abstract = abstract.replace(',', ' ')
		        interests = ''
		        try:
		        	for i in range(0, len(author.interests)):
		        		if len(interests) == 0:
		        			interests = str(author.interests[i])
		        			#interests = regex.sub(' ', interests)
		        		else:
		        			nextInterest = str(author.interests[i])
		        			#nextInterest = regex.sub(' ', nextInterest)
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

		        	# Take note of position of commas using unusual alphabetic series
		        	affiliation = affiliation.replace(',','XYZ')
		        	#affiliation = regex.sub(' ', affiliation)
		        	affiliation = affiliation.replace('XYZ',',')
		        except:
		        	affiliation = 'error'

		        # Default set the year to -1 since the information 
		        # isn't relevant for analysis of this publication set
		        year = -1

		        affiliation = affiliation.replace(',',' / ')

		        
		        test_array = [str(name), url, str(title), str(abstract), str(interests), citations, str(affiliation), year, pictureURL]
		        grid.append(test_array)

    return grid, outputGrid








# Scrapes the top 50 most recent publications from the 
# input list of researchers and outputs a csv with the info
def newGenerateRecentGoogleScholarCSV(list_of_researchers):
	grid = []

	#titles_array = ['Author','URL','Title','Abstract','Keywords','Citations','Affiliation','Year', 'PictureURL']
	#grid.append(titles_array)

	outputGrid = []
	output_columns = ['Name', 'URL', 'SuccessfullyScraped']

	for i in range(0, len(list_of_researchers)):

		#researcher = list_of_researchers.iloc[i][0]
		researcher = ""
		researcher_URL = list_of_researchers.iloc[i][1]

		researcherID = researcher_URL.replace("https://scholar.google.com/citations?user=", "")
		researcherID = researcherID.replace("&hl=en&oi=ao", "")

		#print(researcher)
		search_query = ''
		author = ''
		publications = []

		try:
		  search_query = scholarly.search_author_id(researcherID)
		  author = search_query.fill()
		

		  researcher = author.name
		
		  print(researcher)
   

		  if author != None:

			  publications = author.publications

			  outputGrid.append([researcher, str(researcher_URL), "True"])

		  else:
			  search_query = 'error'
			  author = 'error'

			  outputGrid.append([researcher, str(researcher_URL), "False"])

		except:

			search_query = 'error'
			author = 'error'

			outputGrid.append([researcher, str(researcher_URL), "False"])
      

		if search_query != 'error':

    	# Find the min year and the max year of publication
			max_year = 0
			min_year = 3000
			for publication in publications:
				try:

					if int(publication.bib['year']) > max_year:
						max_year = int(publication.bib['year'])
					if int(publication.bib['year']) < min_year:
						min_year = int(publication.bib['year'])
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
							if int(publication.bib['year']) == max_year - i and counter > 0:

								counter = counter - 1
								print(counter)

								name = researcher
								url = ''

								try:
									url = researcher_URL
								except:
									url = 'error'

								pictureURL = ''
								try:
									pictureURL = "https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=" + researcherID
								except:
									pictureURL = 'error'

								title = ''
								try:
									title = str(publication.fill().bib['title'])
									#title = '"' + title + '"'
									title = title.replace(",", "")
									#title = regex.sub(' ', title)
								except:
									title = 'error'
								#title = title.replace(',', ' ')
								abstract = ''
								try:
									#abstract = clean_abstract(str(publication.fill().bib['abstract']))
									abstract = str(publication.fill().bib['abstract'])
									#abstract = '"' + abstract + '"'
									abstract = abstract.replace(",", "")
									#abstract = regex.sub(' ', abstract)
								except:
									abstract = 'error'
								#abstract = abstract.replace(',', ' ')
								interests = ''
								try:
									for j in range(0, len(author.interests)):
										if len(interests) == 0:
											interests = str(author.interests[j])
											#interests = regex.sub(' ', interests)
										else:
											nextInterest = str(author.interests[j])
											#nextInterest = regex.sub(' ', nextInterest)
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

									# Take note of position of commas using unusual alphabetic series
									affiliation = affiliation.replace(',','XYZ')
									#affiliation = regex.sub(' ', affiliation)
									affiliation = affiliation.replace('XYZ',',')

								except:
									affiliation = 'error'
								affiliation = affiliation.replace(',','/')

								year = 0
								try:
									year = int(publication.bib['year'])
								except:
									year = -1

								test_array = [str(name), url, str(title), str(abstract), str(interests), citations, str(affiliation), year, pictureURL]
								grid.append(test_array)
						except:
							test_array = []
	

	return grid, outputGrid

#######################################################################################

# TYPE YOUR LIST HERE
# example_list = ['Isaac Newton', 'Albert Einstein', 'Galileo']

# Switch "Robert Dicson" to "Robert Dickson"

#scrape_list = ['M.G. Finn', 'Christoph J. Fahrni', "Angus Paul Wilkinson", 'Vinayak Agarwal','Stefan France','Nicholas V. Hud','Julia Kubanek',
#			   'Seth Marder','Adegboyega Oyelere','John R. Reynolds', 'Ingeborg Schmidt-Krey','Loren Dean Williams',
#			   'Bridgette Barry','Robert Dicson','Facundo M. Fernández','Neha Garg','Henry S. La Pierre','Jesse McDaniel',
#			   'Pamela Peralta-Yahya','Paul S. Russo','David Sherrill','Amanda M. Stockton','Ronghu Wu','Marcus T. Cicerone',
#			   'Mostafa A. El-Sayed','Will R. Gutekunst','Joshua Kretchmer','Raquel L. Lieberman','Thomas M Orlando',
#			   'Amit R. Reddi','Joseph P. Sadighi','Carlos Silva','Younan Xia']

#scrape_list = ['Heewook Lee', 'Jed Crandall', 'Stephanie Forrest', 'Subbarao Kambhampati', 'Clément Aubert', 'Rebecca Wright', 'Michael Ekstrand', 'Sole Pera', 'Nam Wook Kim', 'Manos Athanassoulis', 'Reza Rawassizadeh', 'Vasiliki Kalavri', 'Hongfu Liu', 'Pengyu Hong', 'Amanda Lee Hughes', 'Dan Ventura', 'Daniel Ritchie', 'George Konidaris', 'Iris Bahar', 'James Tompkin', 'Seny Kamara', 'Srinath Sridhar', 'Steven Reiss', 'Thomas Serre', 'Amy Greenwald', 'Chris Dancy', 'Evan Peck', 'Scott Davidoff', 'Yisong Yue', 'Adam Perer', 'Alexandra Ion', 'Brandon Lucia', 'Bryan Parno', 'Carlee Joe-Wong', 'Chinmay Kulkarni', 'Chris Atkeson', 'Eric Xing', 'Justine Sherry', 'Keenan Crane', 'Ken Holstein', 'Laura Dabbish', 'Marijn Heule', 'Mayank Goel', 'Mor Harchol-Balter', 'Nathan Beckmann', 'Nicolas Christin', 'Nihar B. Shah', 'Patrick Tague', 'Phillip Gibbons', 'Rashmi Vinayak', 'Sarah Fox', 'Scott Hudson', 'Stefan Mitsch', 'Tuomas Sandholm', 'Vipul Goyal', 'Vyas Sekar', 'Claire Le Goues', 'Bogdan Vasilescu', 'Satya Sahoo', 'Wole Oyekoya', 'Raffi Khatchadourian', 'Cheryl Swanier', 'Soumyabrata Dey', 'Bart Knijnenburg', 'Eileen Kraemer', 'Eric Patterson', 'Guo Freeman', 'Julian Brinkley', 'Kelly Caine', 'Nathan McNeese', 'Paige Rodeghero', 'Hao Zhang', 'Hua Wang', 'Qi Han', 'Tom Williams', 'Mehmet E Belviranli', 'Francisco R. Ortega', 'Brian A. Smith', 'Carl Vondrick', 'Gil Zussman', 'Simha Sethumadhavan', 'Eugene Wu ', 'Christian Kroer', 'Aditya Vashistha', 'Adrian Sampson', 'Bharath Hariharan', 'Cheng Zhang', 'Christopher Batten', 'Cindy Hsin-Liu Kao', 'Elaine Shi', 'Guy Hoffman', 'J. Nathan Matias', 'Keith Evan Green', 'Natalie Bazarova', 'Qian Yang', 'Rachit Agarwal', 'Thorsten Joachims', 'Susan Fussell', 'Mor Naaman', 'Noah Snavely', 'Sasha Rush ', 'Yoav Artzi', 'Serge Belongie', 'Tanzeem Choudhury', 'Deborah Estrin', 'Rajalakshmi Nandakumar', 'Elizabeth Murnane', 'William Scheideler', 'Wojciech Jarosz', 'Enid Montague', 'Aleksandra Sarcevic', 'Andrea Forte', 'Baris Taskin', 'Colin Gordon', 'Jina Huh-Yoo', 'Vasilis Gkatzelis ', 'Ashwin Machanavajjhala', 'Cynthia Rudin', 'Jun Yang', 'Kartik Nayak', 'Sudeepa Roy', 'Maria Gorlatova', 'Eugene Agichtein', 'Lauren Klein', 'Mark Weiss', 'Michael Gubanov', 'Raja Kushalnagar', 'Aditya Johri', 'Huzefa Rangwala', 'Sai Manoj P D', 'Vivian Motti', 'Adam J Aviv', 'Ahmed Louri', 'Mahdi Imani', 'Micah Sherr', 'Nathan Schneider', 'Nitin Vaidya', 'Ling Liu', 'Ada Gavrilovska', 'Alex Endert', 'Alex Orso', 'Alexey Tumanov', 'Amy Bruckman', 'Andrea Parker', 'Ashok Goel', 'B. Aditya Prakash', 'Beki Grinter', 'Beth Mynatt', 'Betsy DiSalvo', 'Brian Magerko', 'Carl DiSalvo', 'Chris Le Dantec', 'Devi Parikh', 'Dhruv Batra', 'Diyi Yang', 'Elizabeth Cherry', 'Gregory Abowd', 'Hyesoon Kim', 'Irfan Essa', 'Jessica Roberts', 'John Stasko', 'Judy Hoffman', 'Jun Xu', 'Michael Best', 'Milos Prvulovic', 'Moinuddin Qureshi', 'Neha Kumar', 'Paul Pearce', 'Polo Chau', 'Prasad Tetali', 'Rich Vuduc', 'Rosa Arriaga', 'Santosh Vempala', 'Sauvik Das', 'Sehoon Ha', 'Sonia Chernova', 'Srijan Kumar', 'Srinivas Aluru', 'Swati Gupta', 'Tushar Krishna', 'Umit V. Catalyurek', 'Vivek Sarkar', 'Frank Li', 'Zsolt Kira', 'Keith Edwards', 'Elena Glassman', 'Krzysztof Gajos', 'Minlan Yu', 'Boaz Barak', 'Susan Murphy', 'David Parkes', 'Stephanie Gil', 'Ariel Procaccia', 'Hanspeter Pfister ', 'Madhu Sudan', 'Milind Tambe', 'Salil Vadhan', 'Stuart Shieber', 'James Mickens', 'Rediet Abebe', 'Danda Rawat', 'Gloria Washington', 'Boris Glavic', 'Gurram Gopal', 'Hemanshu Kaul', 'Kyle Hale', 'Shlomo Engelson Argamon', 'Sonja Petrovic', 'Yong Zheng', 'Yuan Hong', 'Yue Duan', 'Zhiling Lan', 'Lynn Dombrowski', 'Christina Chung', 'Dana Habeeb', 'James Clawson', 'Jeffrey Bardzell', 'Katie Siek', 'L Jean Camp', 'Norman Makoto Su', 'Patrick C. Shih', 'Sameer Patil', 'Shaowen Bardzell', 'Selma Sabanovic', 'Rajiv Ratn Shah', 'Adarsh Krishnamurthy', 'Arup Kumar Ghosh', 'Chien-Ming Huang', 'Michael Dinitz', 'Ryan Huang', 'Ramazan Aygun', 'Dominic DiFranzo', 'Xiaochen Guo', 'Eric P. S. Baumer', 'Michael Zimmer', 'Shion Guha', 'Emilee Rader', 'H. Metin Aktulga', 'Rick Wash', 'Susan Wyche', 'Arvind Satyanarayan', 'David Sontag ', 'Dean Eckles', 'Ekene Ijeoma', 'Fadel Adib', 'Neha Narula', 'Pratik Shah', 'Ramesh Raskar', 'Sai Ravela', 'Eytan Modiano\n\n', 'Kinnis Gosha', 'Cornelia Connolly', 'Huiyang Zhou', 'Chase Wu', 'Grace Guiling Wang', 'Hai Phan', 'James Geller', 'D. Yvette Wohn', 'David A. Bader', 'Jason Wang', 'Jing Li', 'Usman Roshan', 'Zhi Wei', 'Z O. Toups', 'Amy Hurst', 'Claudio Silva', 'Oded Nov', 'Baruch Schieber', 'Alexandros Kapravelos', 'Anupam Das', 'Chris Martens', 'Chris Parnin', 'Laurie Williams ', 'Edgar Lobaton', 'Bruce Maxwell', 'Aanjhan Ranganathan', 'Caglar Yildirim', 'Devesh Tiwari', 'Michelle Borkin', 'Morgan Vigil-Hayes', 'Maoyuan Sun', 'Aaron Shaw', 'Bryan Pardo', 'Darren Gergle', 'Jennie Rogers', 'Jeremy Birnholtz', 'Josiah Hester', 'Maia Jacobs', 'Nick Diakopoulos', 'Noshir Contractor', 'Suzan van der Lee', 'Benjamin Hernandez', 'Anish Arora', 'Yusu Wang', 'Avinash Karanth', 'Savas Kaya ', 'Sathyanarayanan Aakur', 'Michael L. Nelson', 'Michele C. Weigle', 'Lynn Andrea Stein', 'Alan Fern', 'Anita Sarma', 'Arash Termehchy', 'Jinsub Kim', 'Margaret Burnett', 'Minsuk Kahng', 'Prasad Tadepalli', 'Stefan Lee', 'Thomas Dietterich', 'V John Mathews', 'Fuxin Li', 'Benjamin Hanrahan', 'Danfeng Zhang', 'Eric B. Ford', 'Gang Tan', 'John M. Carroll', 'Saeed Abdullah', 'Shomir Wilson', 'Syed Rafiul Hussain', 'Ting-Hao (Kenneth) Huang', 'Joseph C. Osborn', 'Austin Toombs', 'Berkay Celik', 'Bruno Ribeiro', 'Milind Kulkarni', 'Muhammad Shahbaz', 'Roopsha Samanta', 'Sanjay Rao', 'Tiark Rompf', 'Colin Gray', 'Anastasios Kyrillidis', 'Ang Chen', 'Anshumali Shrivastava', 'Ashok Veeraraghavan', 'Devika Subramanian', 'John Mellor-Crummey', 'Luay Nakhleh', 'Lydia Kavraki', 'Moshe Vardi', 'Nathan Dautenhahn', 'Vicky Yao', "Marcia K. O'Malley", 'Cecilia O. Alm', 'Ifeoma Nwogu', 'Matt Huenerfauth', 'Reynold Bailey', 'Ghulam Rasool', 'Amelie Marian', 'Antonina Mitrofanova', 'Santosh Nagarakatte', 'Srinivas Narayana', 'Vivek Singh', 'Yongfeng Zhang', 'Chelsea Finn', 'Clark Barrett', 'Doug James', 'Gordon Wetzstein', 'James Landay', 'Johan Ugander', 'Karen Liu', 'Leonidas Guibas', 'Mary Wootters', 'Sean Follmer', 'Serena Yeung', 'Zakir Durumeric', 'Sang Won Bae', 'Klaus Mueller', 'Michael Zingale', 'Niranjan Balasubramanian', 'Kevin Crowston', 'Radhika Garg', 'Reza Zafarani', 'Jamie Payton', 'Jeeeun Kim', 'Tim Davis', 'Michel A. Kinsy', 'Dilma Da Silva', 'Greg Shakhnarovich', 'Karen Livescu', 'Donna Slonim', 'Jeff Foster', 'Lenore J. Cowen', 'Matthias Scheutz', 'Michael Hughes', 'Raja Sambasivan', 'Remco Chang', 'Robert Jacob', 'Soha Hassoun', 'Brian Summa', 'Aditya Parameswaran', 'David Bamman', 'Deirdre Mulligan', 'Jenna Burrell', 'John Chuang', 'Marti Hearst', 'Niloufar Salehi', 'John Owens', 'Zhou Yu', 'Andre van der Hoek', 'Brian Demsky', 'Daniel Epstein', 'David Redmiles', 'Gillian Hayes', 'Iftekhar Ahmed', 'Paul Dourish', 'Sangeetha Abdu Jyothi', 'Stacy Branham', 'Yunan Chen', 'Zhou (Joe) Li', 'Daniel Wong', 'Hung-Wei Tseng', 'Manu Sridharan', 'Mohsen Lesani', 'Philip Brisk', 'Sheldon Tan', 'Albert Hsiao', 'Christine Alvarado', 'Hao Su', 'Laurel Riek', 'Lilly Irani', 'Nadir Weibel', 'Pengtao Xie', 'Ravi Ramamoorthi', 'Rose Yu', 'Shamim Nemati', 'Xiaolong Wang', 'Yiying Zhang', 'Reza Abbasi-Asl', 'Arpit Gupta', 'Jennifer Jacobs', 'William Wang', 'Angus Forbes', 'Kai-Wei Chang', 'Nanyun (Violet) Peng', 'Yizhou Sun', 'Rakesh Kumar', 'Volodymyr Kindratenko', 'Saiph Savage', 'Manuel A. PÃ©rez-QuiÃ±ones', 'Razvan Bunescu', 'Indranil (Indy) Gupta', 'Lawrence Rauchwerger', 'Nicole Ellison', 'Nikola Banovic', 'Chinwe Ekenna', 'Mariya Zheleva', 'Murat Demirbas', 'Atri Rudra', 'Stefan Bonn', 'Carlos Scheidegger', 'Josh Levine', 'Kate Isaacs', 'Michelle Strout', 'Stephen Kobourov', 'Barna Saha', 'Puneet Gupta', 'Heng Yin', 'Jiasi Chen', 'K. K. Ramakrishnan', 'Nael Abu-Ghazaleh', 'Salman Asif', 'Srikanth Krishnamurthy', 'Vagelis Hristidis', 'Vagelis Papalexakis', 'Yan Gu', 'Yihan Sun', 'Zhiyun Qian', 'Pamela Wisniewski', 'Ben Zhao', 'Blase Ur', 'Diana Franklin', 'Eric Jonas', 'Heather Zheng', 'Junchen Jiang', 'Marshini Chetty', 'Nick Feamster ', 'Pedro Lopes', 'Raul Castro Fernandez', 'Yuxin Chen', 'Aaron Clauset', 'Brian Keegan', 'Casey Fiesler', 'Chenhao Tan', 'Daniel Szafir', 'Danielle Szafir', 'Eric Keller', 'Eric Rozner', 'Jed Brubaker', 'Leysia Palen', 'Steve Voida', 'Joshua Grochow', 'Rafael Frongillo', 'Gedare Bloom', 'Tam Nguyen', 'Vishal Saxena', 'Sanchari Das', 'Adrian E. Roitberg', 'Alina Zare', 'Christina Gardner-McCune', 'Daniela Oliveira', 'Jaime Ruiz', 'Juan E. Gilbert', 'Parisa Rashidi', 'Sharon Lynn Chu', 'Eric Ragan', 'Damon Woodard', 'Shannon Quinn', 'Sheldon H. Jacobson', 'Will Perkins', 'Lev Reyzin', 'Xinhua Zhang', 'Abolfazl Asudeh ', 'Balajee Vamanan', 'Chris Kanich', 'Elena Zheleva', 'Jason Polakis', 'LuÃ\xads Pina', 'Julia Hockenmaier', 'Mohammed El-Kebir', 'Sarita Adve', 'Sasa Misailovic', 'Tandy Warnow', 'Venu Veeravalli', 'Andrew Miller', 'Deepak Vasisht', 'Eshwar Chandrasekharan', 'Haitham Hassanieh', 'Harsh Taneja', 'Josep Torrellas', 'Craig Zilles', 'Lawrence Rauchwerger', 'Mark Neubauer', 'Nancy Amato', 'Nigel Bosch', 'Reyhaneh Jabbarvand', 'Saugata Ghose', 'Sibin Mohan', 'Vikram Adve', 'Yang Wang', 'Yun Huang', 'Abdul Dakkak', 'Chandra Chekuri', 'Dakshita Khurana', 'Gang Wang', 'Sanmi Koyejo', 'Hari Sundaram', 'Karthik Chandrasekaran', 'Cesare Tinelli', 'Omar Chowdhury', 'Stephen Baek', 'Penny Rheingans', 'Abhinav Bhatele', 'Amanda Lazar', 'Dave Levin', 'Eun Kyoung Choe', 'Ge Gao', 'Huaishu Peng', 'Jessica Vitak', 'Joel Chan', 'John Dickerson', 'Marine Carpuat', 'Massimo Ricotti', 'Michelle Mazurek', 'Pratap Tokekar', 'Rob Patro', 'Andrea Kleinsmith', 'Aryya Gangopadhyay', 'Carolyn Seaman', 'Jianwu Wang', 'Maryam Rahnemoonfar', 'Mohamed Younis', 'Naghmeh Karimi', 'Nirmalya Roy', 'Sanjay Purushotham', 'Cynthia Matuszek', 'Frank Ferraro', 'Hamed Pirsiavash', 'Helena Mentis', 'Marc Olano', 'Ravi Kuber', 'Riadul Islam', 'Tim Finin', 'Tim Oates', 'Ting Zhu', 'Tulay Adali', 'Foad Hamidi', 'Hernisa Kacorri', "Brendan O'Connor", 'Dan Sheldon', 'Hamed Zamani', 'Madalina Fiterau', 'Mohammad Hajiesmaili', 'Narges Mahyar', 'Yuriy Brun', 'Ramesh Sitaraman', 'Hengyong Yu', 'Baris Kasikci', 'Chad Jenkins', 'Chris Peikert', 'Daniel M Romero', 'David Jurgens', 'Florian Schaub', 'Julie Hui', 'Junaid Farooq', 'Libby Hemphill', 'Michael Nebeling', 'Mosharaf Chowdhury', 'Nazanin Andalibi', 'Oliver Haimson', 'Paramveer Dhillon', 'Robin Brewer', 'Sarita Schoenebeck', 'Silvia Lindtner', 'Steve Oney', 'Tawanna Dillahunt', 'Tiffany Veinot', 'Xinyu Wang', 'Yan Chen', 'Mark Guzdial', 'Mahdi Cheraghchi', 'Grant Schoenebeck', 'Vitaliy Popov', 'Lana Yarosh', 'Loren Terveen', 'Maria Gini', 'Sophia Knight', 'Praveen Rao', 'Yugyung Lee', 'Abde Mtibaa', 'Andrea Wiggins', 'Briana Morrison', 'Spyridon Mastorakis', 'Phani Vadrevu', 'Lisa Vizer', 'Mohammad Jarrahi', 'Mohit Bansal', 'Snigdha Chaturvedi', 'Colin Raffel', 'Shashank Srivastava', 'Sayamindu Dasgupta', 'Chaoli Wang', 'Siddharth Joshi', 'Eric Eaton', 'Vijay Kumar', 'Duncan Watts', 'David Tipper', 'Adriana Kovashka', 'Chenliang Xu', 'Dan Gildea', 'Ehsan Hoque', 'Lane A. Hemaspaandra', 'Michael Scott', 'Zhen Bai', 'Sandhya Dwarkadas', 'Selcuk Kose', 'Gonzalo Mateos', 'Alark Joshi', 'Pooyan Jamshidi', 'Polinpapilinho Katina', 'Paul Rosen', 'Yu Sun', 'Sudeep Sarkar', 'Shaun Canavan', 'Marvin Andujar', 'Shrikanth (Shri) Narayanan', 'Yan Liu', 'Aleksandra Korolova', 'Alex Williams', 'Cesar Torres', 'Calvin Lin', 'Chandrajit Bajaj', 'Christopher Rossbach', 'Danna Gurari', 'Diana Marculescu', 'Edison Thomaz', 'Emmett Witchel', 'Etienne Vouga', 'Eunsol Choi', 'Greg Durrett', 'Hovav Shacham', 'Jacek Gwizdka', 'Justin Hart', 'Ken Fleischmann', 'Kristen Grauman', 'Matthew Lease', 'Min Kyung Lee', 'Peter Stone', 'Philipp KrÃ¤henbÃ¼hl', 'Radu Marculescu', 'Risto Miikkulainen', 'Scott Niekum', 'Simon Peter', 'Swarat Chaudhuri', 'Yuke Zhu', 'Cem Yuksel', 'Eliane Wiese', 'Jason Wiese', 'Jeff Phillips', 'Marina Kogan', 'Michael Young ', 'Miriah Meyer', 'Rajeev Balasubramonian', 'Rogelio E. Cardona-Rivera', 'Suresh Venkatasubramanian', 'Tucker Hermans', 'Vivek Srikumar', 'Zvonimir Rakamaric', 'Afsaneh Doryab', 'Hongning Wang', 'Matthew Dwyer', 'Samira Khan', 'Seongkook Heo', 'Yangfeng Ji', 'Yuan Tian', 'Amy Zhang', 'Anind Dey', 'Arvind Krishnamurthy', 'Benjamin Mako Hill', 'Cecilia Aragon', 'Charlotte Lee', 'Chirag Shah', 'Daniela Rosner', 'David Ribes', 'Franziska Roesner', 'Gary Hsieh', 'Jen Mankoff', 'Jon E. Froehlich', 'Julie Kientz', 'Kurtis Heimerl', 'Leah Findlater', 'Sean Munson', 'Sheng Wang', 'Tanushree Mitra', 'Amy Ko', 'Aditya Akella', 'Aws Albarghouthi', 'Jacob Thebault-Spieker', "Loris D'Antoni", 'Rahul Chatterjee', 'Shivaram Venkataraman', 'Lili Qiu', 'Kristin Searle', 'Anuj Karpatne', 'Bimal Viswanath', 'Francisco Servant', 'Jia-Bin Huang', 'Kurt Luther', 'Matthew Hicks', 'Sang Won Lee', 'T. M. Murali', 'Wallace Lages', 'Jana Doppa', 'Alvitta Ottley', 'Caitlin Kelleher', 'Neal Patwari', 'Adwait Jog', 'Denys Poshyvanyk', 'Erin Solovey', 'Gillian Smith', 'Loris Fichera', 'Robert Walls', 'Tian Guo', 'Amin Karbasi', 'Holly Rushmeier', 'Lin Zhong', 'Yang Cai']


df = pd.read_csv('ResearchersDataset.csv')

cited, results = newGenerateCitedGoogleScholarCSV(df)

titles_array = ['Author','URL','Title','Abstract','Keywords','Citations','Affiliation','Year', 'PictureURL']
cited = pd.DataFrame(cited, columns=titles_array) 
print(cited.columns)
print(cited.head())

cited.to_parquet('citedScholarDataset.gzip')

#citedArray = numpy.array(cited)
#numpy.savetxt('citedScholarDataset.csv', citedArray, delimiter=',', fmt='%s', encoding ='utf8')

resultsArray = numpy.array(results)
numpy.savetxt('ResearchersScrapedCited.csv', resultsArray, delimiter=',', fmt='%s', encoding ='utf8')


############################################################





#recent, recentResults = newGenerateRecentGoogleScholarCSV(df)

#recentArray = numpy.array(recent)
#numpy.savetxt('Testing3.csv', recentArray, delimiter=',', fmt='%s', encoding ='utf8')

#recentResultsArray = numpy.array(recentResults)
#numpy.savetxt('Testing4.csv', recentResultsArray, delimiter=',', fmt='%s', encoding ='utf8')






#cited = generateCitedGoogleScholarCSV(scrape_list)

#print("Completed Cited Publication Scraping!")
#citedArray = numpy.array(cited)
#numpy.savetxt('citedScholarDataset.csv', citedArray, delimiter=',', fmt='%s', encoding ='utf8')


#recent = generateRecentGoogleScholarCSV(scrape_list)

#print("Completed Recent Publication Scraping!")
#recentArray = numpy.array(recent)
#numpy.savetxt('recentScholarDataset.csv', recentArray, delimiter=',', fmt='%s', encoding ='utf8')


#########################################################################################