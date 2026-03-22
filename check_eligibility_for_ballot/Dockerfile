FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY check_eligibility_for_ballot.py .

EXPOSE 5016

CMD ["python", "check_eligibility_for_ballot.py"]
