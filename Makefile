VERSION = $(shell cat VERSION)
MAJOR = $(shell echo $(VERSION) | cut -f 1 -d ".")
MINOR = $(shell echo $(VERSION) | cut -f 2 -d ".")
NEWMINOR = $(shell expr $(MINOR) + 1)
REGISTRY_HOST = docker-registry.intra.poltsi.fi

all: publish_kontti publish_kontti_db

build_kontti:
	docker build -t kontti-frontend:$(VERSION) -f Dockerfile-kontti .

build_kontti_db:
	docker build -t kontti-db:$(VERSION) -f Dockerfile-postgresql .

run_local_kontti: build_kontti build_kontti_db
	docker run -d -h kontti_fe.docker -p 8282:80    --name 'konttilocal' kontti-frontend:$(VERSION)
	docker run -d -h kontti_de.docker -p 15432:5432 --name 'konttilocaldb' kontti-db:$(VERSION)

publish_kontti: build_kontti
	docker tag kontti-frontend:$(VERSION) $(REGISTRY_HOST)/kontti-frontend:$(VERSION)
	docker tag kontti-frontend:$(VERSION) $(REGISTRY_HOST)/kontti-frontend:latest
	docker push $(REGISTRY_HOST)/kontti-frontend:$(VERSION)
	docker push $(REGISTRY_HOST)/kontti-frontend:latest

publish_kontti_db: build_kontti_db
	docker tag kontti-db:$(VERSION) $(REGISTRY_HOST)/kontti-db:$(VERSION)
	docker tag kontti-db:$(VERSION) $(REGISTRY_HOST)/kontti-db:latest
	docker push $(REGISTRY_HOST)/kontti-db:$(VERSION)
	docker push $(REGISTRY_HOST)/kontti-db:latest

bump_version:
	echo "$(MAJOR).$(NEWMINOR)" > VERSION; \
	cat docker-compose.yml.tmpl | \
	sed -e 's/KONTTI_VERSION/$(MAJOR).$(NEWMINOR)/' | \
	sed -e 's/KONTTI_REGISTRY/$(REGISTRY_HOST)/' \
	> docker-compose.yml; \
	git commit -s -m "* Bump version" VERSION

clean:
	docker stop konttilocal konttilocaldb; \
	docker rm konttilocal konttilocaldb; \
	docker images | grep kontti | cut -c 64-75 | sort | uniq | xargs docker rmi --force
